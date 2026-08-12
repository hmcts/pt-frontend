const ZAPI_BASE_URL = process.env['ZEPHYR_API_BASE_URL'] ?? 'https://tools.hmcts.net/jira/rest/zapi/latest';
const JIRA_UI_BASE_URL = process.env['JIRA_UI_BASE_URL'] ?? 'https://tools.hmcts.net/jira';
const DEFAULT_VERSION_ID = '-1';
/** PTSD → Cycle Summary → Unscheduled → Regression test cycle */
const DEFAULT_TARGET_CYCLE_ID = '3976';
const DEFAULT_TARGET_CYCLE_NAME = 'Regression';
/** Jira project display name as used by Zephyr execution navigator queries */
const DEFAULT_ZEPHYR_PROJECT_NAME = 'HDP Property Tribunal Service ';
const DEFAULT_ZEPHYR_FIX_VERSION = 'Unscheduled';
const JOB_POLL_INTERVAL_MS = 500;
const JOB_POLL_TIMEOUT_MS = 60_000;

export type ZephyrApiConfig = {
  authToken: string;
  projectId: string;
  versionId: string;
};

type NamedZephyrNode = {
  id: string;
  name: string;
  raw: Record<string, unknown>;
};

type ZephyrJobProgress = {
  completed?: boolean;
  failed?: boolean;
  progress?: number;
  message?: string;
  errorMessage?: string;
};

type ZephyrExecutionSearchResponse = {
  executions?: {
    id: string | number;
    issueKey?: string;
    folderId?: string | number | null;
  }[];
};

type ZephyrFolderCreateResponse = {
  id: string | number;
};

function authHeaders(authToken: string): Record<string, string> {
  return {
    Authorization: authToken,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

function readName(value: Record<string, unknown>): string | null {
  for (const key of ['name', 'cycleName', 'folderName']) {
    const candidate = value[key];
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return null;
}

function readId(value: Record<string, unknown>, fallbackKey?: string): string | null {
  for (const key of ['id', 'cycleId', 'folderId']) {
    const candidate = value[key];
    if (candidate !== undefined && candidate !== null && String(candidate).trim()) {
      return String(candidate);
    }
  }

  return fallbackKey ?? null;
}

function collectNamedNodes(value: unknown, fallbackId?: string, nodes: NamedZephyrNode[] = []): NamedZephyrNode[] {
  if (Array.isArray(value)) {
    for (const entry of value) {
      collectNamedNodes(entry, undefined, nodes);
    }
    return nodes;
  }

  if (typeof value !== 'object' || value === null) {
    return nodes;
  }

  const record = value as Record<string, unknown>;
  const name = readName(record);
  const id = readId(record, fallbackId);

  if (name && id) {
    nodes.push({
      id,
      name,
      raw: record,
    });
  }

  for (const [key, entry] of Object.entries(record)) {
    if (['name', 'cycleName', 'folderName', 'id', 'cycleId', 'folderId'].includes(key)) {
      continue;
    }

    if (typeof entry === 'object' && entry !== null) {
      const nestedId = /^\d+$/.test(key) ? key : undefined;
      collectNamedNodes(entry, nestedId, nodes);
    }
  }

  return nodes;
}

async function zapiRequest<T>(
  config: ZephyrApiConfig,
  method: 'GET' | 'PUT' | 'POST' | 'DELETE',
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${ZAPI_BASE_URL}${path}`, {
    method,
    headers: authHeaders(config.authToken),
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload: unknown = text;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    throw new Error(`Zephyr API ${method} ${path} failed with ${response.status}: ${text}`);
  }

  return payload as T;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pollJobProgress(config: ZephyrApiConfig, jobProgressToken: string): Promise<ZephyrJobProgress> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < JOB_POLL_TIMEOUT_MS) {
    const progress = await zapiRequest<ZephyrJobProgress>(
      config,
      'GET',
      `/execution/jobProgress/${encodeURIComponent(jobProgressToken)}`
    );

    if (progress.failed) {
      throw new Error(
        `Zephyr job ${jobProgressToken} failed: ${progress.errorMessage ?? progress.message ?? 'unknown error'}`
      );
    }

    if (progress.completed || progress.progress === 1) {
      return progress;
    }

    await sleep(JOB_POLL_INTERVAL_MS);
  }

  throw new Error(`Timed out waiting for Zephyr job ${jobProgressToken} to complete`);
}

export async function listCycleTreeNodes(config: ZephyrApiConfig): Promise<NamedZephyrNode[]> {
  const payload = await zapiRequest<unknown>(
    config,
    'GET',
    `/cycle?projectId=${encodeURIComponent(config.projectId)}&versionId=${encodeURIComponent(config.versionId)}`
  );

  return collectNamedNodes(payload);
}

export async function findCycleIdByName(config: ZephyrApiConfig, cycleName: string): Promise<string | null> {
  const nodes = await listCycleTreeNodes(config);
  const normalized = cycleName.trim().toLowerCase();
  const matches = nodes.filter(node => node.name.toLowerCase() === normalized);

  if (matches.length === 0) {
    return null;
  }

  return matches[matches.length - 1]?.id ?? null;
}

async function listExecutions(
  config: ZephyrApiConfig,
  cycleId: string
): Promise<{ id: string; issueKey: string; folderId: string | null }[]> {
  const payload = await zapiRequest<ZephyrExecutionSearchResponse>(
    config,
    'GET',
    `/execution?projectId=${encodeURIComponent(config.projectId)}&versionId=${encodeURIComponent(config.versionId)}&cycleId=${encodeURIComponent(cycleId)}`
  );

  return (payload.executions ?? [])
    .map(execution => ({
      id: String(execution.id),
      issueKey: execution.issueKey?.trim() ?? '',
      folderId:
        execution.folderId === undefined || execution.folderId === null || execution.folderId === ''
          ? null
          : String(execution.folderId),
    }))
    .filter(execution => execution.issueKey);
}

function sanitizeFolderName(name: string): string {
  return name.replace(/:/g, '-').trim();
}

function buildRunFolderName(sourceCycleName: string): string {
  const override = readEnv('ZEPHYR_RUN_FOLDER_NAME');
  if (override) {
    return sanitizeFolderName(override);
  }

  return sanitizeFolderName(sourceCycleName.trim());
}

async function listCycleFolderNames(config: ZephyrApiConfig, cycleId: string): Promise<Set<string>> {
  const folders = await listCycleFoldersRaw(config, cycleId);
  return new Set(folders.map(name => name.toLowerCase()));
}

async function listCycleFoldersRaw(config: ZephyrApiConfig, cycleId: string): Promise<string[]> {
  const payload = await zapiRequest<
    { folderName?: string; name?: string }[] | { folders?: { folderName?: string; name?: string }[] }
  >(
    config,
    'GET',
    `/cycle/${encodeURIComponent(cycleId)}/folders?projectId=${encodeURIComponent(config.projectId)}&versionId=${encodeURIComponent(config.versionId)}`
  );

  const folders = Array.isArray(payload) ? payload : (payload.folders ?? []);
  return folders
    .map(folder => folder.folderName?.trim() ?? folder.name?.trim())
    .filter((name): name is string => Boolean(name));
}

export async function listCycleFolders(config: ZephyrApiConfig, cycleId: string): Promise<string[]> {
  return (await listCycleFoldersRaw(config, cycleId)).sort((left, right) => left.localeCompare(right));
}

async function createFolderInCycle(
  config: ZephyrApiConfig,
  cycleId: string,
  folderName: string
): Promise<ZephyrFolderCreateResponse> {
  const attempts: Record<string, unknown>[] = [
    {
      cycleId: Number(cycleId),
      name: folderName,
      projectId: Number(config.projectId),
      versionId: Number(config.versionId),
      description: '',
    },
    {
      cycleId,
      name: folderName,
      projectId: config.projectId,
      versionId: config.versionId,
      description: '',
    },
  ];

  let lastError: Error | undefined;

  for (const body of attempts) {
    try {
      return await zapiRequest<ZephyrFolderCreateResponse>(config, 'POST', '/folder/create', body);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error(`Failed to create folder "${folderName}"`);
}

async function createUniqueFolderInCycle(
  config: ZephyrApiConfig,
  cycleId: string,
  preferredName: string
): Promise<{ folderId: string; folderName: string }> {
  const existingNames = await listCycleFolderNames(config, cycleId);
  let folderName = preferredName;

  if (existingNames.has(folderName.toLowerCase())) {
    const now = new Date();
    const pad = (value: number): string => String(value).padStart(2, '0');
    folderName = `${preferredName} ${pad(now.getSeconds())}`;
  }

  const response = await createFolderInCycle(config, cycleId, folderName);

  return {
    folderId: String(response.id),
    folderName,
  };
}

function pickCopiedExecutionIds(
  targetExecutions: { id: string; issueKey: string; folderId: string | null }[],
  sourceIssueKeys: Set<string>
): string[] {
  const copiedExecutionIds: string[] = [];

  for (const issueKey of sourceIssueKeys) {
    const matches = targetExecutions
      .filter(
        execution => execution.issueKey === issueKey && (execution.folderId === null || execution.folderId === '-1')
      )
      .sort((left, right) => Number(right.id) - Number(left.id));

    const newestExecution = matches[0];
    if (newestExecution) {
      copiedExecutionIds.push(newestExecution.id);
    }
  }

  return copiedExecutionIds;
}

async function moveExecutionsToFolder(
  config: ZephyrApiConfig,
  cycleId: string,
  folderId: string,
  executionIds: string[]
): Promise<void> {
  const response = await zapiRequest<{ jobProgressToken?: string }>(
    config,
    'PUT',
    `/cycle/${encodeURIComponent(cycleId)}/move/executions/folder/${encodeURIComponent(folderId)}`,
    {
      projectId: Number(config.projectId),
      versionId: Number(config.versionId),
      schedules: executionIds.map(executionId => Number(executionId)),
    }
  );

  if (response.jobProgressToken) {
    await pollJobProgress(config, response.jobProgressToken);
  }
}

async function copyExecutionsToCycle(
  config: ZephyrApiConfig,
  targetCycleId: string,
  executionIds: string[]
): Promise<void> {
  const response = await zapiRequest<{ jobProgressToken?: string }>(
    config,
    'PUT',
    `/cycle/${encodeURIComponent(targetCycleId)}/copy`,
    {
      executions: executionIds,
      projectId: config.projectId,
      versionId: config.versionId,
      clearStatusFlag: false,
      clearDefectMappingFlag: false,
    }
  );

  if (response.jobProgressToken) {
    await pollJobProgress(config, response.jobProgressToken);
  }
}

async function deleteCycle(config: ZephyrApiConfig, cycleId: string): Promise<void> {
  const response = await zapiRequest<{ jobProgressToken?: string }>(
    config,
    'DELETE',
    `/cycle/${encodeURIComponent(cycleId)}`
  );

  if (response.jobProgressToken) {
    await pollJobProgress(config, response.jobProgressToken);
  }
}

export function getZephyrApiConfig(): ZephyrApiConfig {
  const authToken = process.env['JIRA_AUTH_TOKEN'];
  if (!authToken) {
    throw new Error('JIRA_AUTH_TOKEN environment variable is required for Zephyr cycle integration');
  }

  return {
    authToken,
    projectId: (process.env['JIRA_PROJECT_ID'] ?? '29506').trim(),
    versionId: (process.env['ZEPHYR_VERSION_ID'] ?? DEFAULT_VERSION_ID).trim(),
  };
}

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

function isTargetCycleMergeDisabled(): boolean {
  return readEnv('ZEPHYR_TARGET_CYCLE_DISABLED', 'ZEPHYR_CYCLE_FOLDER_DISABLED') === 'true';
}

function readTargetCycleId(): string | undefined {
  return readEnv('ZEPHYR_TARGET_CYCLE_ID', 'ZEPHYR_REGRESSION_CYCLE_ID', 'ZEPHYR_CYCLE_FOLDER_ID');
}

function readTargetCycleName(): string | undefined {
  return readEnv('ZEPHYR_TARGET_CYCLE_NAME', 'ZEPHYR_REGRESSION_CYCLE_NAME', 'ZEPHYR_CYCLE_FOLDER_NAME');
}

export function getConfiguredTargetCycleName(): string {
  return readTargetCycleName() ?? DEFAULT_TARGET_CYCLE_NAME;
}

export async function resolveTargetCycleId(config: ZephyrApiConfig): Promise<string> {
  const explicitTargetCycleId = readTargetCycleId();
  if (explicitTargetCycleId) {
    return explicitTargetCycleId;
  }

  const targetCycleName = getConfiguredTargetCycleName();
  const resolvedTargetCycleId = await findCycleIdByName(config, targetCycleName);
  if (resolvedTargetCycleId) {
    return resolvedTargetCycleId;
  }

  return DEFAULT_TARGET_CYCLE_ID;
}

function readZephyrProjectName(): string {
  return readEnv('ZEPHYR_PROJECT_NAME', 'JIRA_PROJECT_NAME') ?? DEFAULT_ZEPHYR_PROJECT_NAME;
}

function readZephyrFixVersion(): string {
  return readEnv('ZEPHYR_FIX_VERSION', 'ZEPHYR_VERSION_NAME') ?? DEFAULT_ZEPHYR_FIX_VERSION;
}

export function buildZephyrExecutionNavUrl(options: {
  cycleName: string;
  folderName?: string;
  projectName?: string;
  fixVersion?: string;
}): string {
  const projectName = options.projectName ?? readZephyrProjectName();
  const fixVersion = options.fixVersion ?? readZephyrFixVersion();
  const queryParts = [
    `project = "${projectName}"`,
    `fixVersion = "${fixVersion}"`,
    `cycleName in ("${options.cycleName}")`,
  ];

  if (options.folderName) {
    queryParts.push(`folderName in ("${options.folderName}")`);
  }

  return `${JIRA_UI_BASE_URL}/secure/enav/#?query=${encodeURIComponent(queryParts.join(' AND '))}`;
}

export async function mergeCreatedCycleIntoTargetCycle(sourceCycleName: string): Promise<string | null> {
  if (isTargetCycleMergeDisabled()) {
    console.log('Skipping target cycle merge because ZEPHYR_TARGET_CYCLE_DISABLED=true');
    return null;
  }

  const config = getZephyrApiConfig();
  const targetCycleId = await resolveTargetCycleId(config);
  const targetCycleName = getConfiguredTargetCycleName();
  const sourceCycleId = await findCycleIdByName(config, sourceCycleName);

  if (!sourceCycleId) {
    throw new Error(`Could not find Zephyr test cycle "${sourceCycleName}" created by the upload step.`);
  }

  const sourceExecutions = await listExecutions(config, sourceCycleId);
  if (sourceExecutions.length === 0) {
    throw new Error(`No executions found in source cycle "${sourceCycleName}" (id ${sourceCycleId}).`);
  }

  const runFolderName = buildRunFolderName(sourceCycleName);
  const cycleRootUrl = buildZephyrExecutionNavUrl({ cycleName: targetCycleName });
  let tempCycleDeleted = false;

  try {
    if (sourceCycleId !== targetCycleId) {
      console.log(
        `Copying ${sourceExecutions.length} execution(s) from temporary cycle "${sourceCycleName}" (id ${sourceCycleId}) ` +
          `into "${targetCycleName}" (id ${targetCycleId})`
      );
      await copyExecutionsToCycle(
        config,
        targetCycleId,
        sourceExecutions.map(execution => execution.id)
      );
      await deleteCycle(config, sourceCycleId);
      tempCycleDeleted = true;
    }

    let folderId: string;
    let folderName: string;

    try {
      ({ folderId, folderName } = await createUniqueFolderInCycle(config, targetCycleId, runFolderName));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `Could not create folder "${runFolderName}" in "${targetCycleName}" (id ${targetCycleId}): ${message}`
      );
      console.warn(`Executions were saved at the "${targetCycleName}" cycle root instead.`);
      console.log(`Test run URL: ${cycleRootUrl}`);
      return cycleRootUrl;
    }

    const targetExecutions = await listExecutions(config, targetCycleId);
    const copiedExecutionIds = pickCopiedExecutionIds(
      targetExecutions,
      new Set(sourceExecutions.map(execution => execution.issueKey))
    );

    if (copiedExecutionIds.length === 0) {
      throw new Error(
        `Could not find copied executions in "${targetCycleName}" (id ${targetCycleId}) to move into folder "${folderName}".`
      );
    }

    console.log(
      `Moving ${copiedExecutionIds.length} execution(s) into folder "${folderName}" (id ${folderId}) under "${targetCycleName}" (id ${targetCycleId})`
    );
    await moveExecutionsToFolder(config, targetCycleId, folderId, copiedExecutionIds);

    const testRunUrl = buildZephyrExecutionNavUrl({
      cycleName: targetCycleName,
      folderName,
    });

    if (sourceCycleId !== targetCycleId) {
      console.log(
        `Saved test run in "${targetCycleName}" → "${folderName}" and removed temporary cycle ${sourceCycleId}`
      );
    } else {
      console.log(`Saved test run in "${targetCycleName}" → "${folderName}"`);
    }
    console.log(`Test run URL: ${testRunUrl}`);

    return testRunUrl;
  } finally {
    if (!tempCycleDeleted && sourceCycleId !== targetCycleId) {
      try {
        await deleteCycle(config, sourceCycleId);
        console.log(`Removed temporary cycle ${sourceCycleId} after merge step`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Could not remove temporary cycle ${sourceCycleId}: ${message}`);
      }
    }
  }
}

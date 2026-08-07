#!/usr/bin/env node
import {
  findCycleIdByName,
  getConfiguredTargetCycleName,
  getZephyrApiConfig,
  listCycleFolders,
  listCycleTreeNodes,
  resolveTargetCycleId,
} from './zephyr-cycle-folder';

async function main(): Promise<void> {
  const config = getZephyrApiConfig();
  const nodes = await listCycleTreeNodes(config);
  const targetCycleName = getConfiguredTargetCycleName();

  console.log(`Cycle tree nodes for project ${config.projectId}, version ${config.versionId}:`);
  for (const node of nodes.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`- cycle id=${node.id} name="${node.name}"`);
  }

  const targetCycleId = await resolveTargetCycleId(config);
  const targetByName = await findCycleIdByName(config, targetCycleName);

  console.log(`\nConfigured target cycle name: ${targetCycleName}`);
  console.log(`Resolved target cycle id: ${targetCycleId}`);
  if (targetByName && targetByName !== targetCycleId) {
    console.log(`Latest cycle named "${targetCycleName}": ${targetByName}`);
  }

  const folders = await listCycleFolders(config, targetCycleId);
  console.log(`\nFolders in "${targetCycleName}" (id ${targetCycleId}):`);
  if (folders.length === 0) {
    console.log('- (none)');
  } else {
    for (const folderName of folders) {
      console.log(`- ${folderName}`);
    }
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

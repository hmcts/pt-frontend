#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';

type CucumberTag = {
  name: string;
  line?: number;
};

type CucumberStep = {
  keyword?: string;
  name?: string;
  line?: number;
  result?: {
    status?: string;
    duration?: number;
    error_message?: string;
  };
  embeddings?: unknown[];
  arguments?: unknown[];
  match?: {
    location?: string;
  };
};

type CucumberElement = {
  executed?: boolean;
  keyword?: string;
  name?: string;
  line?: number;
  tags?: CucumberTag[];
  steps?: CucumberStep[];
  type?: string;
};

type CucumberFeature = {
  keyword?: string;
  name?: string;
  line?: number;
  uri?: string;
  tags?: CucumberTag[];
  elements?: CucumberElement[];
};

const reportPath = path.resolve(process.cwd(), process.argv[2] ?? 'functional-output/zephyr/cucumber-report.json');
const featuresRoot = path.resolve(process.cwd(), 'src/test/functional/features');

function findFeatureUri(featureName: string): string | undefined {
  const files = fs.readdirSync(featuresRoot).filter(file => file.endsWith('.feature'));

  for (const file of files) {
    const absolutePath = path.join(featuresRoot, file);
    const content = fs.readFileSync(absolutePath, 'utf8');
    const featureLine = content
      .split('\n')
      .find(line => line.trim().startsWith('Feature:') && line.includes(featureName.replace(/^Feature:\s*/, '')));

    if (featureLine || content.includes(`Feature: ${featureName}`)) {
      return path.relative(process.cwd(), absolutePath).split(path.sep).join('/');
    }
  }

  return undefined;
}

function sanitiseFeature(feature: CucumberFeature): CucumberFeature {
  const resolvedUri = findFeatureUri(feature.name ?? '');

  return {
    ...feature,
    uri: resolvedUri ?? feature.uri,
    elements: (feature.elements ?? []).map(({ executed: _executed, ...element }) => element),
  };
}

if (!fs.existsSync(reportPath)) {
  console.warn(`Cucumber report not found at ${reportPath}; skipping post-processing.`);
  process.exit(0);
}

const raw = fs.readFileSync(reportPath, 'utf8');
const features = JSON.parse(raw) as CucumberFeature[];
const sanitised = features.map(sanitiseFeature);

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(sanitised, null, 2));
console.log(`Post-processed Cucumber report at ${reportPath}`);

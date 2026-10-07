import { AppInsights } from '@modules/appinsights';
import { PropertiesVolume } from '@modules/properties-volume';

try {
  new PropertiesVolume().enable();
} catch (err) {
  const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
  process.stderr.write(`Failed to start server: could not load secrets from the properties volume\n${detail}\n`);
  process.exit(1);
}

new AppInsights().enable();

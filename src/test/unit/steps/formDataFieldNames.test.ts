import path from 'path';

import ts from 'typescript';

import { stepRegistry as applicationStepRegistry } from '../../../main/steps/application/stepRegistry';
import { stepRegistry as landlordResponseStepRegistry } from '../../../main/steps/landlord-response/stepRegistry';
import { stepRegistry as linkPartyToCaseStepRegistry } from '../../../main/steps/link-party-to-case/stepRegistry';
import { stepRegistry as newApplicationStepRegistry } from '../../../main/steps/new-application/stepRegistry';
import { stepRegistry as preApplicationStepRegistry } from '../../../main/steps/pre-application/stepRegistry';

import type { StepDefinition } from '@modules/steps/stepFormData.interface';

const ROOT = path.resolve(__dirname, '../../../..');
const HELPERS = path.join(ROOT, 'src/main/modules/steps/formBuilder/helpers.ts');
const LOOKUPS = new Set(['getFormData', 'getFormDataString']);

interface Lookup {
  location: string;
  step: string;
  field: string;
}

const fieldsByStep = new Map<string, ReadonlySet<string>>(
  [
    applicationStepRegistry,
    landlordResponseStepRegistry,
    linkPartyToCaseStepRegistry,
    newApplicationStepRegistry,
    preApplicationStepRegistry,
  ].flatMap(registry =>
    Object.values(registry as Record<string, StepDefinition>).map(step => [step.name, new Set(step.fieldNames ?? [])])
  )
);

function literalValues(checker: ts.TypeChecker, node: ts.Node): string[] {
  const type = checker.getTypeAtLocation(node);
  const parts = type.isUnion() ? type.types : [type];
  return parts.every(part => part.isStringLiteral()) ? parts.map(part => (part as ts.StringLiteralType).value) : [];
}

function isLookup(checker: ts.TypeChecker, call: ts.CallExpression): boolean {
  let symbol = checker.getSymbolAtLocation(call.expression);
  if (symbol && symbol.flags & ts.SymbolFlags.Alias) {
    symbol = checker.getAliasedSymbol(symbol);
  }
  const declaration = symbol?.declarations?.[0];
  return !!symbol && LOOKUPS.has(symbol.name) && path.resolve(declaration?.getSourceFile().fileName ?? '') === HELPERS;
}

function accessedFields(checker: ts.TypeChecker, access: ts.Node): string[] {
  if (ts.isPropertyAccessExpression(access)) {
    return [access.name.text];
  }
  if (ts.isElementAccessExpression(access)) {
    return literalValues(checker, access.argumentExpression);
  }
  return [];
}

function collectLookups(): Lookup[] {
  const configPath = path.join(ROOT, 'tsconfig.json');
  const config = ts.parseJsonConfigFileContent(ts.readConfigFile(configPath, ts.sys.readFile).config, ts.sys, ROOT);
  const mainFiles = config.fileNames.filter(file => path.resolve(file).startsWith(path.join(ROOT, 'src/main')));
  const program = ts.createProgram(mainFiles, config.options);
  const checker = program.getTypeChecker();
  const lookups: Lookup[] = [];

  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile || !mainFiles.includes(sourceFile.fileName)) {
      continue;
    }

    const stepDataVariables = new Map<ts.Symbol, string[]>();
    const where = (node: ts.Node): string => {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      return `${path.relative(ROOT, sourceFile.fileName)}:${line + 1}`;
    };
    const record = (node: ts.Node, steps: string[], fields: string[]): void => {
      for (const step of steps) {
        for (const field of fields) {
          lookups.push({ location: where(node), step, field });
        }
      }
    };

    const findCalls = (node: ts.Node): void => {
      if (ts.isCallExpression(node) && isLookup(checker, node) && node.arguments.length >= 2) {
        const steps = literalValues(checker, node.arguments[1]);
        if (node.arguments.length >= 3) {
          record(node, steps, literalValues(checker, node.arguments[2]));
        } else if (ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) {
          const variable = checker.getSymbolAtLocation(node.parent.name);
          if (variable) {
            stepDataVariables.set(variable, steps);
          }
        } else {
          record(node, steps, accessedFields(checker, node.parent));
        }
      }
      ts.forEachChild(node, findCalls);
    };

    const findVariableAccesses = (node: ts.Node): void => {
      if (
        (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) &&
        ts.isIdentifier(node.expression)
      ) {
        const variable = checker.getSymbolAtLocation(node.expression);
        const steps = variable && stepDataVariables.get(variable);
        if (steps) {
          record(node, steps, accessedFields(checker, node));
        }
      }
      ts.forEachChild(node, findVariableAccesses);
    };

    findCalls(sourceFile);
    if (stepDataVariables.size) {
      findVariableAccesses(sourceFile);
    }
  }

  return lookups;
}

describe('form data lookups', () => {
  const lookups = collectLookups();

  it('finds the lookups in src/main', () => {
    expect(lookups.length).toBeGreaterThan(50);
  });

  it('only read steps and fields that are declared', () => {
    const unknown = lookups
      .filter(({ step, field }) => !fieldsByStep.get(step)?.has(field))
      .map(({ location, step, field }) =>
        fieldsByStep.has(step)
          ? `${location}: step '${step}' has no field '${field}'`
          : `${location}: no step named '${step}'`
      );

    expect(unknown).toEqual([]);
  });
});

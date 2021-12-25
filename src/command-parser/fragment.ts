import { CommandParserError } from "./error-base";

export class FragmentLimitError extends CommandParserError {
  message = "引数が多すぎます。";
}

export type CommandFragments = {
  readonly prefix: string;
  readonly arguments: readonly string[];
  readonly options: { [name: string]: string };
};

type InterpretationElements = {
  arguments: string[];
  options: { [name: string]: string };
};
const iterationLimit = 100 as const;
export function fragmentCommand(command: string, prefixes: readonly string[]): CommandFragments | undefined {
  const readPrefixResult = readPrefix(command, prefixes);
  if (!readPrefixResult) return;

  let remain = readPrefixResult.remain;
  let iteration = 0;
  const elements: InterpretationElements = { arguments: [], options: {} };

  while (remain.length > 0) {
    if (++iteration >= iterationLimit) {
      throw new FragmentLimitError();
    }

    const readOptionResult = readOption(remain);
    if (readOptionResult) {
      remain = readOptionResult.remain;
      elements.options[readOptionResult.key] = readOptionResult.value;
      continue;
    }

    const readArgumentResult = readArgument(remain);
    if (readArgumentResult) {
      remain = readArgumentResult.remain;
      elements.arguments.push(readArgumentResult.value);
      continue;
    }

    break;
  }

  return {
    prefix: readPrefixResult.prefix,
    arguments: elements.arguments,
    options: elements.options
  };
}

type ReadPrefixResult = { prefix: string; remain: string };
function readPrefix(content: string, prefixes: readonly string[]): ReadPrefixResult | undefined {
  for (const prefix of prefixes) {
    if (!content.startsWith(prefix)) continue;
    return {
      prefix,
      remain: content.substring(prefix.length).trimStart()
    };
  }
}

type ReadOptionResult = { key: string; value: string; remain: string };
const optionRegex = /^\s*-+(\w+)\s+(\S+)(.*?)$/;
function readOption(content: string): ReadOptionResult | undefined {
  const match = content.match(optionRegex);
  if (!match) return;
  const captures = match as string[];
  return {
    key: captures[1],
    value: captures[2],
    remain: captures[3]
  };
}

type ReadArgumentResult = { value: string; remain: string };
const argumentRegex = /^\s*(\S+)(.*?)$/;
function readArgument(content: string): ReadArgumentResult | undefined {
  const match = content.match(argumentRegex);
  if (!match) return;
  const captures = match as string[];
  return {
    value: captures[1],
    remain: captures[2]
  };
}

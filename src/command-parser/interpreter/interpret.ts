import { CommandParserError } from "../error-base";
import { fragmentCommand } from "./fragment";
import { CommandFormatArgumentsCount, CommandFormatOptionsKey } from "../base-types";

export class UnexpectedArgumentError extends CommandParserError {
  public readonly expected: number;
  public readonly actual: number;

  public constructor(expected: number, actual: number) {
    super();
    this.expected = expected;
    this.actual = actual;
    this.message = `引数の数が違います。${expected.toString()} 個の引数が必要ですが、${actual.toString()} 個入力されています。`;
  }
}

export class UnknownOptionsError extends CommandParserError {
  public readonly optionsName: readonly string[];

  public constructor(optionsName: readonly string[]) {
    super();
    this.optionsName = optionsName;
    this.message = `オプション ${optionsName.map((name) => `"${name}"`).join(", ")} は要求されていません。`;
  }
}

export type InterpretArguments<TArgumentsCount extends CommandFormatArgumentsCount> = {
  0: readonly [];
  1: readonly [string];
  2: readonly [string, string];
  3: readonly [string, string, string];
  4: readonly [string, string, string, string];
  5: readonly [string, string, string, string, string];
}[TArgumentsCount];

export type InterpretOptions<TOptionsKey extends CommandFormatOptionsKey> = {
  readonly [key in TOptionsKey[number]]?: string;
};

export type InterpretFormat<
  TArgumentsCount extends CommandFormatArgumentsCount,
  TOptionsKey extends CommandFormatOptionsKey
> = {
  readonly prefixes: readonly string[];
  readonly argumentsCount: TArgumentsCount;
  readonly optionsName: TOptionsKey;
};

export type InterpretResult<
  TArgumentsCount extends CommandFormatArgumentsCount,
  TOptionsKey extends CommandFormatOptionsKey
> = {
  readonly prefix: string;
  readonly arguments: InterpretArguments<TArgumentsCount>;
  readonly options: InterpretOptions<TOptionsKey>;
};

export function interpretCommand<
  TArgumentsCount extends CommandFormatArgumentsCount,
  TOptionsKey extends CommandFormatOptionsKey
>(
  command: string,
  format: InterpretFormat<TArgumentsCount, TOptionsKey>
): InterpretResult<TArgumentsCount, TOptionsKey> | undefined {
  const fragments = fragmentCommand(command, format.prefixes);
  if (!fragments) return;
  return {
    prefix: fragments.prefix,
    arguments: checkArgumentCount(fragments.arguments, format.argumentsCount),
    options: checkOptionName(fragments.options, format.optionsName)
  };
}

function checkArgumentCount<TArgumentsCount extends CommandFormatArgumentsCount>(
  values: readonly string[],
  count: TArgumentsCount
): InterpretArguments<TArgumentsCount> {
  if (values.length !== count) {
    throw new UnexpectedArgumentError(count, values.length);
  }
  return values as InterpretArguments<TArgumentsCount>; // sorry.
}

function checkOptionName<TOptionsKey extends CommandFormatOptionsKey>(
  values: { [name: string]: string },
  keys: TOptionsKey
): InterpretOptions<TOptionsKey> {
  const unknownOptions = Object.keys(values).filter((name) => !(name in keys));
  if (unknownOptions.length > 0) {
    throw new UnknownOptionsError(unknownOptions);
  }
  const init: InterpretOptions<TOptionsKey> = {};
  return keys.reduce((prev, key) => ({ ...prev, key: values[key] }), init);
}

import { CommandParserError } from "../error-base";
import { fragmentCommand } from "./fragment";
import { CommandFormatArgumentsCount, CommandFormatOptions, ConvertPatternSet } from "../base-types";

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

type InternalInterpretOptions<
  TConvertPatternSet extends ConvertPatternSet,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
> = {
  [key in keyof TOptions]?: string;
};

export type InterpretOptions<
  TConvertPatternSet extends ConvertPatternSet,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
> = {
  readonly [key in keyof TOptions]?: string;
};

export type InterpretFormat<
  TConvertPatternSet extends ConvertPatternSet,
  TArgumentsCount extends CommandFormatArgumentsCount,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
> = {
  readonly prefixes: readonly string[];
  readonly argumentsCount: TArgumentsCount;
  readonly optionsName: TOptions;
};

export type InterpretResult<
  TConvertPatternSet extends ConvertPatternSet,
  TArgumentsCount extends CommandFormatArgumentsCount,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
> = {
  readonly prefix: string;
  readonly arguments: InterpretArguments<TArgumentsCount>;
  readonly options: InterpretOptions<TConvertPatternSet, TOptions>;
};

export function interpretCommand<
  TConvertPatternSet extends ConvertPatternSet,
  TArgumentsCount extends CommandFormatArgumentsCount,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
>(
  command: string,
  format: InterpretFormat<TConvertPatternSet, TArgumentsCount, TOptions>
): InterpretResult<TConvertPatternSet, TArgumentsCount, TOptions> | undefined {
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

function checkOptionName<
  TConvertPatternSet extends ConvertPatternSet,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
>(values: { [name: string]: string }, formats: TOptions): InterpretOptions<TConvertPatternSet, TOptions> {
  const unknownOptions = Object.keys(values).filter((name) => !(name in formats));
  if (unknownOptions.length > 0) {
    throw new UnknownOptionsError(unknownOptions);
  }
  const init: InternalInterpretOptions<TConvertPatternSet, TOptions> = {};
  return Object.keys(formats).reduce((prev, curr) => {
    const key = curr as keyof TOptions;
    prev[key] = values[curr];
    return prev;
  }, init);
}

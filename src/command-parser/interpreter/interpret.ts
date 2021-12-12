import { CommandParserError } from "../error-base";
import { fragmentCommand } from "./fragment";
import { CommandFormatArguments } from "../base-types";
import { CommandFormatOn, ConvertTypeSetBase } from "../parser";

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

export type CountOf<
  TConvertTypeSet extends ConvertTypeSetBase,
  TCommandFormatArguments extends CommandFormatArguments<TConvertTypeSet>
  > = TCommandFormatArguments["length"];

export type InterpretArguments<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormatOn<TConvertTypeSet>
> = {
  0: readonly [];
  1: readonly [string];
  2: readonly [string, string];
  3: readonly [string, string, string];
  4: readonly [string, string, string, string];
  5: readonly [string, string, string, string, string];
}[CountOf<TConvertTypeSet, TFormat["arguments"]>];

type InternalInterpretOptions<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormatOn<TConvertTypeSet>
> = {
  [key in keyof TFormat["options"]]?: string;
};

export type InterpretOptions<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormatOn<TConvertTypeSet>
> = {
  readonly [key in keyof TFormat["options"]]?: string;
};

export type InterpretFormat<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormatOn<TConvertTypeSet>
> = {
  readonly prefixes: readonly string[];
  readonly argumentsCount: TFormat["arguments"];
  readonly optionsName: TFormat["options"];
};

export type InterpretResult<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormatOn<TConvertTypeSet>
> = {
  readonly prefix: string;
  readonly arguments: InterpretArguments<TConvertTypeSet, TFormat>;
  readonly options: InterpretOptions<TConvertTypeSet, TFormat>;
};

export function interpretCommand<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormatOn<TConvertTypeSet>
>(
  command: string,
  format: InterpretFormat<TConvertTypeSet, TFormat>
): InterpretResult<TConvertTypeSet, TFormat> | undefined {
  const fragments = fragmentCommand(command, format.prefixes);
  if (!fragments) return;
  return {
    prefix: fragments.prefix,
    arguments: checkArgumentCount(fragments.arguments, format.argumentsCount),
    options: checkOptionName(fragments.options, format.optionsName)
  };
}

function checkArgumentCount<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormatOn<TConvertTypeSet>
>(values: readonly string[], args: TFormat["arguments"]): InterpretArguments<TConvertTypeSet, TFormat> {
  if (values.length !== args.length) {
    throw new UnexpectedArgumentError(args.length, values.length);
  }
  return values as InterpretArguments<TConvertTypeSet, TFormat>; // sorry.
}

function checkOptionName<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormatOn<TConvertTypeSet>
>(values: { [name: string]: string }, formats: TFormat["options"]): InterpretOptions<TConvertTypeSet, TFormat> {
  const unknownOptions = Object.keys(values).filter((name) => !(name in formats));
  if (unknownOptions.length > 0) {
    throw new UnknownOptionsError(unknownOptions);
  }
  const init: InternalInterpretOptions<TConvertTypeSet, TFormat> = {};
  return Object.keys(formats).reduce((prev, curr) => {
    const key = curr as keyof TFormat["options"];
    prev[key] = values[curr];
    return prev;
  }, init);
}

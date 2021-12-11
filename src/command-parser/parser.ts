import { interpretCommand, InterpretResult } from "./interpreter";
import { convertParameter, ConvertType } from "./converter";
import {
  CommandFormatArguments,
  CommandFormatArgumentsCount,
  CommandFormatOptions,
  CommandFormatOptionsKey,
  ConvertPatternSet
} from "./base-types";

export type ConvertTypeSet<TConvertPatternSet extends ConvertPatternSet> = {
  [key in keyof TConvertPatternSet]: ConvertType<TConvertPatternSet[key]>;
};

export type CommandFormatDefault<TConvertPatternSet extends ConvertPatternSet> = CommandFormat<
  TConvertPatternSet,
  CommandFormatArgumentsCount,
  CommandFormatArguments<ConvertPatternSet, CommandFormatArgumentsCount>,
  CommandFormatOptionsKey,
  CommandFormatOptions<ConvertPatternSet, CommandFormatOptionsKey>
>;

export type CommandFormat<
  TConvertPatternSet extends ConvertPatternSet,
  TArgumentsCount extends CommandFormatArgumentsCount,
  TArguments extends CommandFormatArguments<TConvertPatternSet, TArgumentsCount>,
  TOptionKeys extends CommandFormatOptionsKey,
  TOptions extends CommandFormatOptions<TConvertPatternSet, TOptionKeys>
> = {
  readonly prefixes: readonly string[];
  readonly arguments: TArguments;
  readonly options: TOptions;
};

export type CommandResult<
  TConvertPatternSet extends ConvertPatternSet,
  TArgumentsCount extends CommandFormatArgumentsCount,
  TArguments extends CommandFormatArguments<TConvertPatternSet, TArgumentsCount>,
  TOptionKeys extends CommandFormatOptionsKey,
  TOptions extends CommandFormatOptions<TConvertPatternSet, TOptionKeys>
> = {
  readonly prefix: string;
  readonly arguments: CommandResultArguments<TConvertPatternSet, TArgumentsCount, TArguments>;
  readonly options: CommandResultOptions<TConvertPatternSet, TOptionKeys, TOptions>;
};

type Parameter<TConvertPatternSet extends ConvertPatternSet = ConvertPatternSet> = {
  readonly name: string;
  readonly description: string;
  readonly type: keyof TConvertPatternSet;
};

type CommandResultArguments<
  TConvertPatternSet extends ConvertPatternSet,
  TArgumentsCount extends CommandFormatArgumentsCount,
  TArguments extends CommandFormatArguments<TConvertPatternSet, TArgumentsCount>
> = TArguments[0] extends Parameter<TConvertPatternSet>
  ? TArguments[1] extends Parameter<TConvertPatternSet>
    ? TArguments[2] extends Parameter<TConvertPatternSet>
      ? TArguments[3] extends Parameter<TConvertPatternSet>
        ? TArguments[4] extends Parameter<TConvertPatternSet>
          ? [
              TConvertPatternSet[TArguments[0]["type"]],
              TConvertPatternSet[TArguments[1]["type"]],
              TConvertPatternSet[TArguments[2]["type"]],
              TConvertPatternSet[TArguments[3]["type"]],
              TConvertPatternSet[TArguments[4]["type"]]
            ]
          : [
              TConvertPatternSet[TArguments[0]["type"]],
              TConvertPatternSet[TArguments[1]["type"]],
              TConvertPatternSet[TArguments[2]["type"]],
              TConvertPatternSet[TArguments[3]["type"]]
            ]
        : [
            TConvertPatternSet[TArguments[0]["type"]],
            TConvertPatternSet[TArguments[1]["type"]],
            TConvertPatternSet[TArguments[2]["type"]]
          ]
      : [TConvertPatternSet[TArguments[0]["type"]], TConvertPatternSet[TArguments[1]["type"]]]
    : [TConvertPatternSet[TArguments[0]["type"]]]
  : [];

type CommandResultOptions<
  TConvertPatternSet extends ConvertPatternSet,
  TOptionKeys extends CommandFormatOptionsKey,
  TOptions extends CommandFormatOptions<TConvertPatternSet, TOptionKeys>
> = {
  [key in TOptionKeys[number]]?: TConvertPatternSet[TOptions[key]["type"]];
};

function convertArguments<
  TConvertPatternSet extends ConvertPatternSet,
  TArgumentsCount extends CommandFormatArgumentsCount,
  TArguments extends CommandFormatArguments<TConvertPatternSet, TArgumentsCount>,
  TOptionKeys extends CommandFormatOptionsKey,
  TOptions extends CommandFormatOptions<TConvertPatternSet, TOptionKeys>
>(
  values: InterpretResult<TArgumentsCount, TOptionKeys>,
  format: CommandFormat<TConvertPatternSet, TArgumentsCount, TArguments, TOptionKeys, TOptions>,
  types: ConvertTypeSet<TConvertPatternSet>
): CommandResultArguments<TConvertPatternSet, TArgumentsCount, TArguments> {
  const parameters = values.arguments.map((argument, index) => {
    const fmt = format.arguments[index];
    if (!fmt) throw Error();
    const param = {
      name: `${(index + 1).toString()} 番目の引数`,
      description: fmt.description,
      value: values.arguments[index],
      convertType: types[fmt.type]
    };
    return convertParameter(param);
  });
  return parameters as CommandResultArguments<TConvertPatternSet, TArgumentsCount, TArguments>;
}

function convertOptions<
  TConvertPatternSet extends ConvertPatternSet,
  TArgumentsCount extends CommandFormatArgumentsCount,
  TArguments extends CommandFormatArguments<TConvertPatternSet, TArgumentsCount>,
  TOptionKeys extends CommandFormatOptionsKey,
  TOptions extends CommandFormatOptions<TConvertPatternSet, TOptionKeys>
>(
  values: InterpretResult<TArgumentsCount, TOptionKeys>,
  format: CommandFormat<TConvertPatternSet, TArgumentsCount, TArguments, TOptionKeys, TOptions>,
  types: ConvertTypeSet<TConvertPatternSet>
): CommandResultOptions<TConvertPatternSet, TOptionKeys, TOptions> {
  const init: CommandResultOptions<TConvertPatternSet, TOptionKeys, TOptions> = {};
  return Object.keys(format.options).reduce((prev, key: TOptionKeys[number]) => {
    const value: string | undefined = values.options[key];
    if (!value) return prev;
    const param = {
      name: `オプション ${key}`,
      description: format.options[key].description,
      value: value,
      convertType: types[format.options[key].type]
    };

    prev[key] = convertParameter(param);
    return prev;
  }, init);
}

export function parseCommand<
  TConvertPatternSet extends ConvertPatternSet,
  TArgumentsCount extends CommandFormatArgumentsCount,
  TArguments extends CommandFormatArguments<TConvertPatternSet, TArgumentsCount>,
  TOptionKeys extends CommandFormatOptionsKey,
  TOptions extends CommandFormatOptions<TConvertPatternSet, TOptionKeys>
>(
  command: string,
  format: CommandFormat<TConvertPatternSet, TArgumentsCount, TArguments, TOptionKeys, TOptions>,
  types: ConvertTypeSet<TConvertPatternSet>
): CommandResult<TConvertPatternSet, TArgumentsCount, TArguments, TOptionKeys, TOptions> | undefined {
  const interpretFormat = {
    prefixes: format.prefixes,
    argumentsCount: format.arguments.length,
    optionsName: Object.keys(format.options)
  } as const;
  const interpretation = interpretCommand(command, interpretFormat);
  if (!interpretation) return;

  return {
    prefix: interpretation.prefix,
    arguments: convertArguments(interpretation, format, types),
    options: convertOptions(interpretation, format, types)
  };
}

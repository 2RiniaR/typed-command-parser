import { CommandParserError } from "../error-base";
import { CommandFormatArguments, CommandFormatOptions, Parameter } from "./base-types";
import { CommandFormatOn, ConvertTypeSetBase, TypeToReturn } from "./interpret";
import { InterpretResult } from "./label";

export class InvalidFormatError<TReturn extends SupportTypes> extends CommandParserError {
  public readonly parameter: ConvertParameter<TReturn>;

  public constructor(parameter: ConvertParameter<TReturn>) {
    super();
    this.parameter = parameter;
    this.message = `引数の形式が違います。\n${parameter.name} には ${parameter.convertType.name} を入力してください。`;
  }
}

export type SupportTypes = number | string | boolean | object;

export type ConvertType<TReturn extends SupportTypes> = {
  readonly name: string;
  readonly converter: (source: string) => TReturn | undefined;
};

export type ConvertParameter<TReturn extends SupportTypes> = {
  readonly name: string;
  readonly value: string;
  readonly convertType: ConvertType<TReturn>;
};

export function convertParameter<TReturn extends SupportTypes>(parameter: ConvertParameter<TReturn>): TReturn {
  const result = parameter.convertType.converter(parameter.value);
  if (!result) throw new InvalidFormatError(parameter);
  return result;
}

type CommandResultArguments<
  TConvertTypeSet extends ConvertTypeSetBase,
  TArguments extends CommandFormatArguments<TConvertTypeSet>
> = TArguments[0] extends Parameter<TConvertTypeSet>
  ? TArguments[1] extends Parameter<TConvertTypeSet>
    ? TArguments[2] extends Parameter<TConvertTypeSet>
      ? TArguments[3] extends Parameter<TConvertTypeSet>
        ? TArguments[4] extends Parameter<TConvertTypeSet>
          ? [
              TypeToReturn<TConvertTypeSet[TArguments[0]["type"]]>,
              TypeToReturn<TConvertTypeSet[TArguments[1]["type"]]>,
              TypeToReturn<TConvertTypeSet[TArguments[2]["type"]]>,
              TypeToReturn<TConvertTypeSet[TArguments[3]["type"]]>,
              TypeToReturn<TConvertTypeSet[TArguments[4]["type"]]>
            ]
          : [
              TypeToReturn<TConvertTypeSet[TArguments[0]["type"]]>,
              TypeToReturn<TConvertTypeSet[TArguments[1]["type"]]>,
              TypeToReturn<TConvertTypeSet[TArguments[2]["type"]]>,
              TypeToReturn<TConvertTypeSet[TArguments[3]["type"]]>
            ]
        : [
            TypeToReturn<TConvertTypeSet[TArguments[0]["type"]]>,
            TypeToReturn<TConvertTypeSet[TArguments[1]["type"]]>,
            TypeToReturn<TConvertTypeSet[TArguments[2]["type"]]>
          ]
      : [TypeToReturn<TConvertTypeSet[TArguments[0]["type"]]>, TypeToReturn<TConvertTypeSet[TArguments[1]["type"]]>]
    : [TypeToReturn<TConvertTypeSet[TArguments[0]["type"]]>]
  : [];

export type CommandResultOptions<
  TConvertTypeSet extends ConvertTypeSetBase,
  TOptions extends CommandFormatOptions<TConvertTypeSet>
> = {
  [key in keyof TOptions]?: TypeToReturn<TConvertTypeSet[TOptions[key]["type"]]>;
};

export type CommandResult<
  TConvertTypeSet extends ConvertTypeSetBase,
  TArguments extends CommandFormatArguments<TConvertTypeSet>,
  TOptions extends CommandFormatOptions<TConvertTypeSet>
> = {
  readonly prefix: string;
  readonly arguments: CommandResultArguments<TConvertTypeSet, TArguments>;
  readonly options: CommandResultOptions<TConvertTypeSet, TOptions>;
};

export function convertArguments<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormatOn<TConvertTypeSet>
>(
  values: InterpretResult<TConvertTypeSet, TFormat>,
  format: TFormat,
  types: TConvertTypeSet
): CommandResultArguments<TConvertTypeSet, TFormat["arguments"]> {
  const parameters = values.arguments.map((argument, index) => {
    const fmt = format.arguments[index];
    if (!fmt) throw Error();
    const param = {
      name: `${(index + 1).toString()} 番目の引数`,
      value: values.arguments[index],
      convertType: types[fmt.type]
    };
    return convertParameter(param);
  });
  return parameters as CommandResultArguments<TConvertTypeSet, TFormat["arguments"]>;
}

export function convertOptions<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormatOn<TConvertTypeSet>
>(
  values: InterpretResult<TConvertTypeSet, TFormat>,
  format: TFormat,
  types: TConvertTypeSet
): CommandResultOptions<TConvertTypeSet, TFormat["options"]> {
  const results: CommandResultOptions<TConvertTypeSet, TFormat["options"]> = {};

  const options: TFormat["options"] = format.options;
  for (const key in options) {
    const value: string | undefined = values.options[key];
    if (!value) continue;

    results[key] = convertParameter({
      name: `オプション ${key}`,
      value,
      convertType: types[options[key].type]
    }) as TypeToReturn<TConvertTypeSet[TFormat["options"][typeof key]["type"]]>;
  }

  return results;
}

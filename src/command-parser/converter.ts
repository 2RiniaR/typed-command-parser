import { CommandParserError } from "./error-base";

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
  readonly description: string;
  readonly value: string;
  readonly convertType: ConvertType<TReturn>;
};

export function convertParameter<TReturn extends SupportTypes>(parameter: ConvertParameter<TReturn>): TReturn {
  const result = parameter.convertType.converter(parameter.value);
  if (!result) throw new InvalidFormatError(parameter);
  return result;
}

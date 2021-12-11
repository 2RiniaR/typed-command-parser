import { parseCommand } from "./command-parser";

const types = {
  integer: {
    name: "整数",
    converter: (value: string) => {
      const num = parseInt(value);
      if (isNaN(num)) return;
      return num;
    }
  },

  float: {
    name: "実数",
    converter: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) return;
      return num;
    }
  },

  string: {
    name: "文字列",
    converter: (value: string) => {
      return value;
    }
  }
} as const;

const format = {
  prefixes: ["/search-message", "/message search"] as const,
  arguments: [
    {
      name: "テスト文字列（引数1）",
      description: "文字列を入力してね（必須）",
      type: "string"
    },
    {
      name: "テスト実数（引数2）",
      description: "実数を入力してね（必須）",
      type: "float"
    },
    {
      name: "テスト整数（引数3）",
      description: "整数を入力してね（必須）",
      type: "integer"
    }
  ] as const,
  options: {
    content: {
      name: "テスト文字列（オプション）",
      description: "文字列を入力してね（任意）",
      type: "string"
    } as const,
    page: {
      name: "テスト整数（オプション）",
      description: "整数を入力してね（任意）",
      type: "integer"
    } as const
  } as const
} as const;

const commands = [
  "/search-message hello 10.2 440 --content hoge --page 3",
  "/message search typescript 33.4 91",
  "/search-message rust 99.9 256 --content gamma",
  "/create-message rust 99.9 256 --content gamma",
  "/search-message rust 99.9 256 1209 --content gamma",
  "/search-message rust 99.9 --content gamma",
  "/search-message rust 99.9 256 --content gamma --animal dog",
  "/search-message rust gopher 256 --content gamma",
  "/search-message 111 99.9 256 --page hoge"
];

for (const command of commands) {
  console.log(command);
  try {
    const values = parseCommand(command, format, types);
    if (!values) continue;
    const u = values.options.content;
    console.log(values);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.log("unknown error");
    }
  }
  console.log();
}

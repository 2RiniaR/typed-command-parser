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
  },

  userId: {
    name: "ユーザーID",
    converter: (value: string) => {
      return value;
    }
  }
} as const;

const format = {
  prefixes: ["/timeout", "!timeout"],
  arguments: [
    {
      name: "対象のユーザー",
      type: "userId"
    },
    {
      name: "タイムアウト時間（分）",
      type: "float"
    }
  ],
  options: {
    message: {
      name: "送信する警告文",
      type: "string"
    }
  }
} as const;

const commands = [
  '/timeout 1234567890 0.5 --message "You are timed out."',
  "/timeout 9876543210 1.0",
  "/timeout 1234567890 hoge",
  '/timeout 1234567890 --message "You are timed out."',
  '/timeout 1234567890 0.5 --message "You are timed out." --page 2',
  '!timeout 1234567890 0.5 --message "You are timed out."'
];

function showCommand(command: string) {
  const result = parseCommand(command, format, types);
  console.log(result);
}

for (const command of commands) {
  console.log(command);
  try {
    showCommand(command);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.log("unknown error");
    }
  }
  console.log();
}

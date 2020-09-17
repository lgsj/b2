//您自己的js代码写到下面

    function Copyed2k() {
        // 获取Dom节点
       var copy = document.getElementById('ed2k');
        //  用select函数将文本内容选中
        copy.select();
        document.execCommand('Copy');
        alert('复制成功')

    }

 function CopySHA1() {
        // 获取Dom节点
       var copy = document.getElementById('SHA1');
        //  用select函数将文本内容选中
        copy.select();
        document.execCommand('Copy');
        alert('复制成功')

    }
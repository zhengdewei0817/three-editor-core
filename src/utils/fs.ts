/**
 * 解析对象名字 确认是增加还是删除还是修改
 * __added
 * @param path 
 */
export function splitPath(path: string) {
    const parts = path.split('__');
    if (parts.length === 2) {
        return {
            type: parts[1],
            name: parts[0]
        }
    }
    return null;
}
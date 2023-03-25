const alphabet = "abcdefghijklmnopqrstuvwxyz";

let index = 0;

export function createString(length: number) {
    let str = "";
    while (str.length < length) {
        // eslint-disable-next-line security/detect-object-injection
        str += alphabet[index];
        index++;
        index %= alphabet.length;
    }
    return str;
}

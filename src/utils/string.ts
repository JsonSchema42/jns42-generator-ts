const alphabet = "abcdefghijklmnopqrstuvwxyz";

let index = 0;

export function createString(length: number) {
    let str = "";
    while (str.length < length) {
        str += alphabet[index];
        index += Math.round(Math.random() * alphabet.length);
        index %= alphabet.length;
    }
    return str;
}

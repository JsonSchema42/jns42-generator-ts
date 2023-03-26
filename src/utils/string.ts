const alphabet = "abcdefghijklmnopqrstuvwxyz";

let index = 0;

export function createString(length: number) {
    let str = "";
    while (str.length < length) {

        str += alphabet[index];
        index++;
        index %= alphabet.length;
    }
    return str;
}

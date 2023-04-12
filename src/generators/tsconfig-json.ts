export function getTsconfigJsonData() {
    const content = {
        "compilerOptions": {
            "target": "ES2020",
            "module": "ES2020",
            "moduleResolution": "node",
            "declaration": true,
            "sourceMap": true,
            "importHelpers": true,
            "strict": true,
            "forceConsistentCasingInFileNames": true,
            "esModuleInterop": true,
            "skipLibCheck": true,
        },
    };

    return content;
}


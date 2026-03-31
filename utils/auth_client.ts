export async function setAuthTokenClient(token: string){
    void token;
    throw new Error("Client-side auth cookie writes are not allowed. Use the server action instead.");
}

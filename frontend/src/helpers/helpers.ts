export function refreshPage(){ 
    window.location.reload(); 
}

export function toPage(page: string){
    window.location.reload();
    window.location.href = page;
}
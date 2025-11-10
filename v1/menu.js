const readline = require('readline');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const { stdout, stderr } = require('process');
const axios = require('axios');
const FormData = require('form-data');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Ola Seja bem Vindo");
console.log(`
          .::!!!!!!!::.       
      .!!!!!:.       .:!!!!!!!!!!!!!     
      ~~~~!!!!!!   .:!!!!!!!@@@@@$$$$    
          :@@@WX!!:.<!!!!@@$$$$$$$$$$$   
          $$$$$##WX!:!!U$$$$"  $$$$$$$#  
          $$$$$  $$$UX:!!$$$$$$$$$$$*    
          ^$$$B  $$$$\\\\   $$$$$$$$$$R"   
           "$bd$$$$"     '$$$$$$$$$$o+#" 
             "-====-"            
`);

console.log("1- abrir o vscode");
console.log("2- abrir o my sql e o xampp");
console.log("3- abrir o virtual box");

const prompt = require("prompt-sync")();
let op = prompt("escolha uma opção a cima: ");

switch (op){
    case "1":
        console.log("abrindo o vscode");
        exec('code .', (error, stdout, stderr) => {
          if (error) {
          console.error(`Erro ao abrir o VS Code: ${error.message}`);
        return;
        }
          if (stderr) {
          console.error(`Aviso: ${stderr}`);
          return;
        }
        console.log('VS Code aberto com sucesso!');
        });
    break;

    case "2":
      console.log("abrindo o mysql"); 
      
      const caminhos = [
        "C:\\xampp\\xampp-control.exe",     
        "D:\\xampp\\xampp-control.exe",      
        "E:\\xampp\\xampp-control.exe",     
];
  let xamppPath = caminhos.find(p => fs.existsSync(p));
  if (!xamppPath) {
    console.error("❌ XAMPP não encontrado. Verifique se ele está instalado.");
    process.exit(1);
}
  exec(`"${xamppPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao abrir o XAMPP: ${error.message}`);
    return;
  }
    if (stderr) {
      console.error(`Aviso: ${stderr}`);
    return;
  }
  console.log("✅ XAMPP aberto com sucesso!");
});
//agora e para abrir o mysql
  const paths = [
    'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
    'C:\\Program Files (x86)\\MySQL\\MySQL Server 5.7\\bin\\mysql.exe',
    'C:\\xampp\\mysql\\bin\\mysql.exe',
  ];

  let mysqlPath = paths.find(p => fs.existsSync(p));
    if (!mysqlPath){
      console.error(" o mysql não foi encontrado. verofique se ele esta intalado");
      process.exit(1);
    }
  exec(` "${mysqlPath}" -u root -p` , (error, stdout, stderr) => {
    if (error){
      console.error(`erro ao abrir o mysql: ${error.message}`);
    return;
    }   
    if (stderr) {
      console.error(`aviso: ${stderr}`);
      return;
      }
      console.log('MySQL aberto com sucesso!');
      });
    break;


    case "3":
      console.log("abrindo o virtual box");
      
      const caminho = [
        "C:\\Program Files\\Oracle\\VirtualBox\\VirtualBox.exe",  
        "C:\\Program Files (x86)\\Oracle\\VirtualBox\\VirtualBox.exe",
        "D:\\Program Files\\Oracle\\VirtualBox\\VirtualBox.exe",  
      ];

      let vboxPath = caminho.find(p => fs.existsSync(p));
      if (!vboxPath) {
        console.error(" erro ao abrir o virtualbox.");
        process.exit(1);
      }
      exec(`"${vboxPath}"`, (error, stdout, stderr) => {
        if (error){
          console.error(`erro de ao abrir o virtual box: ${error.message}`);
            return;
        }
        if(stderr){
          console.error(`aviso : ${stderr}`);
          return;
        }
        console.log("virtual box aberto com sucesso");
      });
};
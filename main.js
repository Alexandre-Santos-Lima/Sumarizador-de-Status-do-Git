// ---
// Projeto: Sumarizador de Status do Git (Git Status Summarizer)
// Descrição: Um script Node.js que executa `git status` em um repositório
//            e exibe um resumo conciso das alterações (arquivos modificados,
//            novos, deletados, etc.). É uma ferramenta útil para ter uma
//            visão rápida do estado de um projeto.
//
// Bibliotecas necessárias: Nenhuma. Utiliza apenas módulos nativos do Node.js.
//                          É necessário ter o Node.js e o Git instalados no sistema.
//
// Como executar:
// 1. Navegue até a pasta onde salvou este arquivo.
// 2. Execute o comando passando o caminho para o repositório que deseja analisar.
//
// Exemplo (analisando o diretório atual):
// > node main.js .
//
// Exemplo (analisando outro diretório):
// > node main.js /caminho/para/meu/outro/projeto
// ---

// Importa os módulos necessários do Node.js
const { exec } = require('child_process'); // Para executar comandos do shell
const path = require('path');             // Para manipular caminhos de arquivos
const fs = require('fs');                 // Para interagir com o sistema de arquivos

/**
 * Analisa a saída do comando 'git status --porcelain' e conta os tipos de alterações.
 * @param {string} gitOutput - A string de saída do comando git.
 * @returns {object} Um objeto com a contagem de cada tipo de alteração.
 */
function parseGitStatus(gitOutput) {
    const lines = gitOutput.trim().split('\n').filter(line => line.length > 0);
    const summary = {
        modified: 0,
        added: 0,
        deleted: 0,
        renamed: 0,
        untracked: 0,
        total: lines.length
    };

    lines.forEach(line => {
        const status = line.substring(0, 2);
        if (status.includes('M')) {
            summary.modified++;
        }
        if (status.includes('A')) {
            summary.added++;
        }
        if (status.includes('D')) {
            summary.deleted++;
        }
        if (status.includes('R')) {
            summary.renamed++;
        }
        if (status === '??') {
            summary.untracked++;
        }
    });

    return summary;
}

/**
 * Formata e exibe o resumo das alterações no console.
 * @param {object} summary - O objeto de resumo gerado por parseGitStatus.
 * @param {string} repoPath - O caminho do repositório analisado.
 */
function displaySummary(summary, repoPath) {
    console.log(`\n📊 Resumo do Status do Git para: ${repoPath}`);
    console.log('--------------------------------------------------');

    if (summary.total === 0) {
        console.log('✅ Repositório limpo. Nenhuma alteração pendente.');
        console.log('--------------------------------------------------');
        return;
    }

    if (summary.modified > 0) {
        console.log(`📝 Modificados:   ${summary.modified}`);
    }
    if (summary.added > 0) {
        console.log(`✨ Adicionados (staged): ${summary.added}`);
    }
    if (summary.deleted > 0) {
        console.log(`❌ Deletados:     ${summary.deleted}`);
    }
    if (summary.renamed > 0) {
        console.log(`🔄 Renomeados:    ${summary.renamed}`);
    }
    if (summary.untracked > 0) {
        console.log(`❓ Não rastreados: ${summary.untracked}`);
    }

    console.log('--------------------------------------------------');
    console.log(`Total de arquivos com alterações: ${summary.total}`);
    console.log('--------------------------------------------------');
}

/**
 * Função principal que executa o script.
 */
function main() {
    const targetPath = process.argv[2];

    if (!targetPath) {
        console.error('ERRO: Por favor, forneça o caminho para um repositório Git.');
        console.log('Uso: node main.js <caminho_do_repositorio>');
        return;
    }

    const repoPath = path.resolve(targetPath);

    // Verifica se o diretório existe
    if (!fs.existsSync(repoPath)) {
        console.error(`ERRO: O diretório "${repoPath}" não foi encontrado.`);
        return;
    }
    
    // O comando 'git status --porcelain' é ideal para ser lido por scripts
    const command = 'git status --porcelain';
    
    // Executa o comando no diretório alvo
    exec(command, { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
            console.error(`ERRO ao executar o git: ${error.message}`);
            if (stderr.includes('not a git repository')) {
                console.error(`O diretório "${repoPath}" não parece ser um repositório Git.`);
            }
            return;
        }

        if (stderr) {
            console.error(`Erro do Git: ${stderr}`);
            return;
        }

        const summary = parseGitStatus(stdout);
        displaySummary(summary, repoPath);
    });
}

// Inicia a execução do programa
main();
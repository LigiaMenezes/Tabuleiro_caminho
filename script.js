// JavaScript atualizado para o novo layout

// Variáveis globais
let jogadores = [];
let jogadorAtual = 0;
let posicoesJogadores = {};
let jogoIniciado = false;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    criarInputs();
    adicionarNumerosCasas();
});

// Funções de Modal
function abrirModalJogadores() {
    document.getElementById('modal-jogadores').style.display = 'flex';
}

function fecharModal(id) {
    document.getElementById(id).style.display = 'none';
}

function mostrarRegras() {
    document.getElementById('modal-regras').style.display = 'flex';
}

function voltarMenu() {
    if (jogoIniciado && !confirm('Tem certeza que deseja voltar ao menu? O jogo atual será perdido.')) {
        return;
    }
    
    fecharModal('modal-tabuleiro');
    fecharModal('modal-vitoria');
    fecharModal('modal-regras');
    document.getElementById('menu').classList.add('ativa');
    
    // Resetar jogo
    resetarJogo();
}

function sair() {
    if (confirm('Tem certeza que deseja sair?')) {
        window.close();
    }
}

// Funções de Jogadores
function criarInputs() {
    const qtd = parseInt(document.getElementById('qtdJogadores').value);
    const container = document.getElementById('inputs-nomes');
    container.innerHTML = '';
    
    for (let i = 1; i <= qtd; i++) {
        const div = document.createElement('div');
        div.innerHTML = `
            <label for="jogador${i}">Jogador ${i}:</label>
            <input type="text" id="jogador${i}" placeholder="Nome do jogador ${i}" maxlength="15" value="Jogador ${i}">
        `;
        container.appendChild(div);
    }
}

function iniciarJogo() {
    const qtd = parseInt(document.getElementById('qtdJogadores').value);
    jogadores = [];
    
    // Coletar nomes dos jogadores
    for (let i = 1; i <= qtd; i++) {
        const nomeInput = document.getElementById(`jogador${i}`);
        const nome = nomeInput.value.trim() || `Jogador ${i}`;
        
        jogadores.push({
            id: i,
            nome: nome,
            cor: obterCorJogador(i),
            posicao: 0,
            icone: ['👤', '👨', '👩', '🧑'][i-1] || '👤'
        });
    }
    
    if (jogadores.length < 2) {
        criarPopup(`✅ ${jogador.nome}, resposta correta! Avance 2 casas!`, 'success', 4000);

        return;
    }
    
    // Inicializar posições
    jogadores.forEach(jogador => {
        posicoesJogadores[jogador.id] = 0;
    });
    
    // Configurar interface
    configurarInterfaceJogo();
    
    // Abrir tabuleiro
    fecharModal('modal-jogadores');
    document.getElementById('modal-tabuleiro').style.display = 'flex';
    document.getElementById('menu').classList.remove('ativa');
    
    // Iniciar jogo
    jogoIniciado = true;
    jogadorAtual = 0;
    atualizarInterfaceJogo();
}

function obterCorJogador(numero) {
    const cores = [
        '#FF5252', // Vermelho
        '#4CAF50', // Verde
        '#2196F3', // Azul
        '#FF9800'  // Laranja
    ];
    return cores[numero - 1] || '#9C27B0';
}

// Configuração do Jogo
function configurarInterfaceJogo() {
    // Limpar marcadores antigos
    document.querySelectorAll('.marcador-jogador').forEach(m => m.remove());
    
    // Posicionar jogadores no início
    jogadores.forEach(jogador => {
        const casaInicio = document.querySelector('.casa.inicio');
        if (casaInicio) {
            const marcador = criarMarcadorJogador(jogador);
            casaInicio.appendChild(marcador);
        }
    });
    
    // Atualizar lista de jogadores
    atualizarListaJogadores();
}

function criarMarcadorJogador(jogador) {
    const marcador = document.createElement('div');
    marcador.className = 'marcador-jogador';
    marcador.id = `marcador-${jogador.id}`;
    marcador.style.background = jogador.cor;
    marcador.title = jogador.nome;
    return marcador;
}

function atualizarListaJogadores() {
    const container = document.getElementById('lista-jogadores');
    
    // Encontrar posição real da casa final
    const casaFinal = document.querySelector('.casa.fim');
    let posicaoFinal = 50; // Valor padrão
    
    if (casaFinal) {
        const dataIndex = casaFinal.getAttribute('data-index');
        if (dataIndex) {
            // A posição final é o índice + 1
            posicaoFinal = parseInt(dataIndex) + 1;
        }
    }
    
    const jogadoresHtml = jogadores.map((jogador, index) => {
        const isAtual = index === jogadorAtual;
        const posicaoAtual = posicoesJogadores[jogador.id] + 1; // +1 porque começa em 0
        
        return `
            <div class="jogador-item ${isAtual ? 'atual' : ''}">
                <div class="jogador-cor" style="background: ${jogador.cor}"></div>
                <div class="jogador-info">
                    <div class="jogador-nome">${jogador.icone} ${jogador.nome}</div>
                    <div class="jogador-pos">Posição: ${posicaoAtual}/${posicaoFinal}</div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `<h3><i class="fas fa-list-ol"></i> Jogadores:</h3>${jogadoresHtml}`;
}
// Funções de Jogo
function rolarDado() {
    if (!jogoIniciado || jogadores.length === 0) return;
    
    const btnDado = document.getElementById('btn-rolar-dado');
    const dadoFace = document.getElementById('dado-face');
    const dadoValor = document.getElementById('dado-valor');
    const resultado = document.getElementById('dado-resultado');
    
    // Desabilitar botão durante animação
    btnDado.disabled = true;
    btnDado.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rolando...';
    
    // Animação do dado
    dadoFace.style.animation = 'dadoRolar 1s ease-in-out';
    dadoValor.textContent = '?';
    resultado.textContent = 'Rolando o dado...';
    
    // Gerar valor do dado após animação
    setTimeout(() => {
        const valor = Math.floor(Math.random() * 6) + 1;
        const jogador = jogadores[jogadorAtual];
        
        // Atualizar display
        dadoValor.textContent = valor;
        dadoFace.style.animation = '';
        dadoFace.innerHTML = getDadoIcon(valor);
        resultado.innerHTML = `<strong>${jogador.nome}</strong> rolou um <strong>${valor}</strong>!`;
        
        // Reabilitar botão
        btnDado.disabled = false;
        btnDado.innerHTML = '<i class="fas fa-dice-d20"></i> Rolar Dado';
        
        // Mover jogador
        setTimeout(() => moverJogador(jogador, valor), 500);
    }, 1000);
}

function getDadoIcon(valor) {
    const icons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return icons[valor - 1] || '⚄';
}

async function moverJogador(jogador, passos) {
    const posicaoAtual = posicoesJogadores[jogador.id];
    let novaPosicao;

    const casaFinal = document.querySelector('.casa.fim');
    let posicaoFinal = 50;
    if (casaFinal) {
        const dataIndex = casaFinal.getAttribute('data-index');
        if (dataIndex) posicaoFinal = parseInt(dataIndex);
    }

    if (passos > 0) novaPosicao = Math.min(posicaoAtual + passos, posicaoFinal);
    else novaPosicao = Math.max(posicaoAtual + passos, 0);

    if (novaPosicao === posicaoAtual) {
        criarPopup(`⚠️ ${jogador.nome} está na borda do tabuleiro!`, 'success', 4000);
        passarParaProximoJogador();
        return;
    }

    // ✅ Confirmar movimento
    const movimento = passos > 0 ? `avançar ${passos} casa(s)` : `retroceder ${Math.abs(passos)} casa(s)`;
    const confirmar = await mostrarConfirmacao(`${jogador.nome}, você irá ${movimento}. Confirmar movimento?`);

    if (!confirmar) {
        criarPopup(`${jogador.nome} cancelou o movimento.`, 'warning', 3000);
        passarParaProximoJogador();
        return;
    }

    // Remover da posição antiga
    const casaAtual = document.querySelector(`.casa[data-index="${posicaoAtual}"]`);
    if (casaAtual) {
        const marcador = document.getElementById(`marcador-${jogador.id}`);
        if (marcador) marcador.remove();
    }

    // Adicionar à nova posição
    const novaCasa = document.querySelector(`.casa[data-index="${novaPosicao}"]`);
    if (novaCasa) {
        const marcador = criarMarcadorJogador(jogador);
        novaCasa.appendChild(marcador);
        posicoesJogadores[jogador.id] = novaPosicao;

        novaCasa.style.transform = 'scale(1.1)';
        setTimeout(() => { novaCasa.style.transform = ''; }, 300);
        
        // Vitória
        if (novaCasa.classList.contains('fim') || novaPosicao === posicaoFinal) {
            setTimeout(() => abrirModalVitoria(jogador.nome), 500);
            return;
        }

        // Verificar tipo da casa
        await verificarCasaAtualCompleta(jogador, novaPosicao, passos < 0);
        atualizarInterfaceJogo();

    }
}

// Função auxiliar para passar a vez
function passarParaProximoJogador() {
    jogadorAtual = (jogadorAtual + 1) % jogadores.length;
    atualizarInterfaceJogo();
}

// NOVA FUNÇÃO: Verifica casa atual considerando avanço e retrocesso
function verificarCasaAtualCompleta(jogador, posicao, retrocedeu = false) {
    const casa = document.querySelector(`.casa[data-index="${posicao}"]`);
    const resultado = document.getElementById('dado-resultado');
    
    if (!casa) {
        // Se não tem casa, passar a vez
        setTimeout(() => {
            passarParaProximoJogador();
        }, 500);
        return;
    }
    
    if (casa.classList.contains('pergunta')) {
        if (retrocedeu) {
            resultado.innerHTML = `<strong>${jogador.nome}</strong> retrocedeu para uma casa de pergunta!`;
        } else {
            resultado.innerHTML = `<strong>${jogador.nome}</strong> caiu em uma casa de pergunta!`;
        }
        setTimeout(() => fazerPergunta(jogador), 800);
        
    } else if (casa.classList.contains('especial')) {
        if (retrocedeu) {
            resultado.innerHTML = `<strong>${jogador.nome}</strong> retrocedeu para uma casa especial!`;
            
        } else {
            resultado.innerHTML = `<strong>${jogador.nome}</strong> caiu em uma casa especial!`;
        }
        setTimeout(() => eventoEspecial(jogador), 800);
        
    } else if (casa.classList.contains('voltar')) {
        if (retrocedeu) {
            // Evitar loop infinito: se retrocedeu para casa voltar, passar a vez
            resultado.innerHTML = `<strong>${jogador.nome}</strong> retrocedeu para outra casa ruim! Passa a vez.`;
            setTimeout(() => {
                passarParaProximoJogador();
            }, 800);
        } else {
            eventoVoltar(jogador, casa);
        }
        
    } else {
        // Casa normal
        if (retrocedeu) {
            resultado.innerHTML = `<strong>${jogador.nome}</strong> retrocedeu para a posição ${posicao + 1}.`;
        } else {
            resultado.innerHTML = `<strong>${jogador.nome}</strong> avançou para a posição ${posicao + 1}.`;
        }
        // Casa normal - passa para próximo jogador
        setTimeout(() => {
            passarParaProximoJogador();
        }, 500);
    }
}

// Função antiga mantida para compatibilidade
function verificarCasaAtual(jogador, posicao) {
    verificarCasaAtualCompleta(jogador, posicao, false);
}

let perguntaAtual = null;
let jogadorPerguntaAtual = null;

function fazerPergunta(jogador) {
    jogadorPerguntaAtual = jogador;
    
    const perguntas = [
        {
            pergunta: "Qual tipo de isomeria ocorre quando dois compostos têm mesma fórmula molecular, mas diferentes arranjos espaciais?",
            opcoes: ["Isomeria de função", "Isomeria espacial", "Isomeria de posição", "Isomeria de cadeia"],
            correta: 2
        },
        {
            pergunta: "Qual tipo de isomeria é observada em compostos com mesma fórmula, mas diferentes ligações funcionais?",
            opcoes: ["Isomeria de cadeia", "Isomeria de função", "Isomeria geométrica", "Isomeria óptica"],
            correta: 2
        },
        {
            pergunta: "Em que tipo de isomeria os átomos estão ligados na mesma sequência, mas o arranjo espacial difere?",
            opcoes: ["Isomeria de posição", "Isomeria de função", "Isomeria espacial", "Isomeria de cadeia"],
            correta: 3
        },
        {
            pergunta: "Quando ocorre isomeria óptica?",
            opcoes: ["Quando o composto possui carbono quiral", "Quando há cadeia aberta", "Quando há insaturação", "Quando há heteroátomos"],
            correta: 1
        },
        {
            pergunta: "Qual tipo de isomeria muda a posição do grupo funcional na molécula?",
            opcoes: ["Isomeria de função", "Isomeria de posição", "Isomeria de cadeia", "Isomeria óptica"],
            correta: 2
        },
        {
            pergunta: "O que caracteriza a isomeria de cadeia?",
            opcoes: ["Diferentes grupos funcionais", "Diferentes tipos de cadeia carbônica", "Diferentes arranjos espaciais", "Presença de carbono quiral"],
            correta: 2
        },
        {
            pergunta: "Qual é um exemplo clássico de isomeria geométrica (cis-trans)?",
            opcoes: ["Butano e metilpropano", "Etanol e metoximetano", "cis-2-buteno e trans-2-buteno", "Glicose e frutose"],
            correta: 3
        },
        {
            pergunta: "O que é um carbono quiral?",
            opcoes: ["Carbono com quatro ligantes diferentes", "Carbono em uma cadeia ramificada", "Carbono com dupla ligação", "Carbono ligado a oxigênio"],
            correta: 1
        },
        {
            pergunta: "Qual tipo de isomeria é também conhecida como estereoisomeria?",
            opcoes: ["Isomeria de posição", "Isomeria de função", "Isomeria espacial", "Isomeria de cadeia"],
            correta: 3
        },
        {
            pergunta: "O que são enantiômeros?",
            opcoes: ["Isômeros com diferentes grupos funcionais", "Isômeros ópticos que são imagens especulares não sobreponíveis", "Isômeros com cadeias diferentes", "Isômeros de posição"],
            correta: 2
        }
    ];
    
    // SISTEMA PARA EVITAR REPETIÇÃO DE QUESTÕES
    if (!jogador.perguntasRespondidas) {
        jogador.perguntasRespondidas = [];
    }
    
    let perguntasDisponiveis = perguntas.filter((_, index) => !jogador.perguntasRespondidas.includes(index));
    
    if (perguntasDisponiveis.length === 0) {
        jogador.perguntasRespondidas = [];
        perguntasDisponiveis = perguntas;
    }
    
    const pergunta = perguntasDisponiveis[Math.floor(Math.random() * perguntasDisponiveis.length)];
    const perguntaIndex = perguntas.findIndex(p => p.pergunta === pergunta.pergunta);
    jogador.perguntasRespondidas.push(perguntaIndex);
    
    perguntaAtual = pergunta;
    
    // Configurar modal de pergunta
    document.getElementById('pergunta-jogador-nome').textContent = `Desafio para: ${jogador.nome}`;
    document.getElementById('texto-pergunta').textContent = pergunta.pergunta;
    
    // Configurar opções (removendo números iniciais)
    for (let i = 0; i < pergunta.opcoes.length; i++) {
        const opcaoTexto = pergunta.opcoes[i];
        // Remove o número inicial se existir (ex: "1) Isomeria de função" → "Isomeria de função")
        const textoLimpo = opcaoTexto.replace(/^\d+\)\s*/, '');
        document.getElementById(`opcao${i+1}-texto`).textContent = textoLimpo;
    }
    
    // Mostrar modal
    document.getElementById('modal-pergunta').style.display = 'flex';
}

function responderPergunta(opcaoSelecionada) {
    if (!perguntaAtual || !jogadorPerguntaAtual) return;
    
    const jogador = jogadorPerguntaAtual;
    const respostaCorreta = perguntaAtual.correta;
    
    // Fechar modal
    document.getElementById('modal-pergunta').style.display = 'none';
    
    // Validar resposta
    if (opcaoSelecionada === respostaCorreta) {
        criarPopup(`✅ ${jogador.nome}, resposta correta! Avance 2 casas!`, 'success', 4000);
        moverJogador(jogador, 2);
    } else {
        criarPopup(`❌ ${jogador.nome}, resposta errada! A resposta correta era a opção ${respostaCorreta}. Volte 1 casa.`, 'success', 4000);
        moverJogador(jogador, -1);
    }
    
    // Limpar variáveis
    perguntaAtual = null;
    jogadorPerguntaAtual = null;
}

function eventoVoltar(jogador, casa) {
    const resultado = document.getElementById('dado-resultado');
    const casasParaVoltar = parseInt(casa.getAttribute('data-voltar')) || 1;
    
    resultado.innerHTML = `<strong>${jogador.nome}</strong> caiu em uma casa ruim! Volta ${casasParaVoltar} casa(s).`;
    
    // Usa moverJogador que já passa a vez automaticamente
    moverJogador(jogador, -casasParaVoltar);
}

function eventoEspecial(jogador) {
    const eventos = [
        { tipo: "avançar", texto: "🎯 Achou um atalho! Avance 3 casas!", valor: 3 },
        { tipo: "recuar", texto: "🌊 Escorregou na lama! Volte 2 casas!", valor: -2 },
        { tipo: "pular", texto: "🚀 Teleporte! Pule para a próxima casa especial!", valor: 0 }
    ];
    
    const evento = eventos[Math.floor(Math.random() * eventos.length)];
    criarPopup(evento.texto);
    
    if (evento.tipo === "pular") {
        // Encontrar próxima casa especial (até posição 50)
        let proximaCasa = -1;
        for (let i = posicoesJogadores[jogador.id] + 1; i <= 50; i++) {
            const casa = document.querySelector(`.casa[data-index="${i}"]`);
            if (casa && casa.classList.contains('especial')) {
                proximaCasa = i;
                break;
            }
        }
        
        if (proximaCasa !== -1) {
            const passos = proximaCasa - posicoesJogadores[jogador.id];
            moverJogador(jogador, passos);
        } else {
            // Se não encontrou casa especial, passa a vez normalmente
            passarParaProximoJogador();
        }
    } else {
        moverJogador(jogador, evento.valor);
    }
}

function atualizarInterfaceJogo() {
    if (jogadores.length === 0) return;
    
    const jogador = jogadores[jogadorAtual];
    
    // Encontrar posição real da casa final
    const casaFinal = document.querySelector('.casa.fim');
    let posicaoFinal = 51; // Total de casas = 51
    
    if (casaFinal) {
        const dataIndex = casaFinal.getAttribute('data-index');
        if (dataIndex) {
            // A posição final é o índice + 1
            posicaoFinal = parseInt(dataIndex) + 1;
        }
    }
    
    const posicaoAtual = posicoesJogadores[jogador.id] + 1;
    
    // Atualizar informações do turno
    document.getElementById('jogador-atual-nome').textContent = jogador.nome;
    
    // NOTA: Não existe 'jogador-atual-pos' no HTML, precisamos adicionar ou remover esta linha
    // Se quiser mostrar a posição no turno, adicione este elemento no HTML:
    // <div id="jogador-atual-pos"></div>
    const jogadorAtualPos = document.getElementById('jogador-atual-pos');
    if (jogadorAtualPos) {
        jogadorAtualPos.textContent = `${posicaoAtual}/${posicaoFinal}`;
    }
    
    // Atualizar status do jogo
    const statusJogo = document.getElementById('status-jogo');
    if (statusJogo) {
        statusJogo.textContent = `Turno ${jogadorAtual + 1}/${jogadores.length}`;
    }
    
    // Atualizar lista de jogadores
    atualizarListaJogadores();
    
    // Destacar jogador atual no tabuleiro
    document.querySelectorAll('.marcador-jogador').forEach(marcador => {
        marcador.style.boxShadow = '0 3px 6px rgba(0,0,0,0.3)';
        marcador.style.animation = 'float 3s ease-in-out infinite';
    });
    
    const marcadorAtual = document.getElementById(`marcador-${jogador.id}`);
    if (marcadorAtual) {
        marcadorAtual.style.boxShadow = `0 0 0 3px white, 0 0 15px ${jogador.cor}`;
        marcadorAtual.style.animation = 'float 1.5s ease-in-out infinite';
    }
}
function abrirModalVitoria(vencedor) {
    document.getElementById('nome-vencedor').textContent = `${vencedor} venceu o jogo! 🎉`;
    fecharModal('modal-tabuleiro');
    document.getElementById('modal-vitoria').style.display = 'flex';
}

function resetarJogo() {
    jogadores = [];
    jogadorAtual = 0;
    posicoesJogadores = {};
    jogoIniciado = false;
    
    // Limpar tabuleiro
    document.querySelectorAll('.marcador-jogador').forEach(m => m.remove());
    const dadoValor = document.getElementById('dado-valor');
    if (dadoValor) dadoValor.textContent = '?';
    
    const dadoFace = document.getElementById('dado-face');
    if (dadoFace) dadoFace.innerHTML = '<i class="fas fa-dice"></i>';
    
    const resultado = document.getElementById('dado-resultado');
    if (resultado) resultado.textContent = 'Aguardando jogada...';
}

function adicionarNumerosCasas() {
    document.querySelectorAll('.casa:not(.vazia)').forEach(casa => {
        const index = casa.dataset.index;
        if (index !== undefined) {
            const numero = parseInt(index) + 1;
            const span = document.createElement('span');
            span.className = 'numero-casa';
            span.textContent = numero;
            span.style.cssText = `
                position: absolute;
                bottom: 5px;
                right: 5px;
                font-size: 0.8rem;
                font-weight: bold;
                color: rgba(255, 255, 255, 0.7);
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            `;
            casa.appendChild(span);
        }
    });
}

// FUNÇÃO AUXILIAR: Encontrar posição da casa final
function encontrarPosicaoCasaFinal() {
    const casaFinal = document.querySelector('.casa.fim');
    if (casaFinal) {
        const dataIndex = casaFinal.getAttribute('data-index');
        if (dataIndex) {
            return parseInt(dataIndex);
        }
    }
    return 50; // Posição padrão para 51 casas
}

// FUNÇÃO para debug: contar total de casas
function contarTotalCasas() {
    const casas = document.querySelectorAll('.casa[data-index]');
    console.log(`Total de casas com data-index: ${casas.length}`);
    
    // Encontrar maior índice
    let maxIndex = 0;
    casas.forEach(casa => {
        const index = parseInt(casa.getAttribute('data-index'));
        if (index > maxIndex) maxIndex = index;
    });
    
    console.log(`Maior índice: ${maxIndex}`);
    console.log(`Total de casas (índice + 1): ${maxIndex + 1}`);
    return maxIndex + 1;
}
function criarPopup(mensagem, tipo = 'info', duracao = 3000) {
    const container = document.getElementById('popup-container');
    if (!container) return;

    const popup = document.createElement('div');
    popup.className = `popup ${tipo}`;
    popup.textContent = mensagem;
    container.appendChild(popup);

    // Mostrar animação
    setTimeout(() => {
        popup.classList.add('show');
    }, 50);

    // Remover após duracao
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 500);
    }, duracao);
}

function mostrarConfirmacao(mensagem) {
    return new Promise((resolve) => {
        const popup = document.getElementById('popup-confirm');
        const texto = document.getElementById('popup-confirm-text');
        const btnSim = document.getElementById('popup-confirm-sim');
        const btnNao = document.getElementById('popup-confirm-nao');

        texto.textContent = mensagem;
        popup.style.display = 'flex';

        function limpar() {
            popup.style.display = 'none';
            btnSim.removeEventListener('click', simHandler);
            btnNao.removeEventListener('click', naoHandler);
        }

        function simHandler() { limpar(); resolve(true); }
        function naoHandler() { limpar(); resolve(false); }

        btnSim.addEventListener('click', simHandler);
        btnNao.addEventListener('click', naoHandler);
    });
}

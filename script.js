const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
}

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
}

const shuffle = array => {
    const clonedArray = [...array]

    for (let i = clonedArray.length - 1; i > 0; i--) {
        /**
         * Troca o elemento da iteração atual (i) com um elemento de uma posição aleatória dentro do intervalo da array. Faz isso para todas
         * posições da array. 
         */
        const randomIndex = Math.floor(Math.random() * (i + 1))
        const original = clonedArray[i]

        clonedArray[i] = clonedArray[randomIndex]
        clonedArray[randomIndex] = original
    }

    // retorna o array embaralhado
    return clonedArray
}

const pickRandom = (array, items) => {
    const clonedArray = [...array]
    const randomPicks = []

    for (let i = 0; i < items; i++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length)
        
        // coloca em randomPicks o emoji sorteado
        randomPicks.push(clonedArray[randomIndex])
        // tira o emoji sorteado da array, para que ele não seja escolhido novamente
        clonedArray.splice(randomIndex, 1)
    }

    return randomPicks
}

const generateGame = () => {
    // dimensão do jogo Y em data-dimension: YxY
    const dimensions = selectors.board.getAttribute('data-dimension')  

    // dimensão precisa ser par, pois o produto de dois números pares é um número par e todas as cards devem ter uma outra igual no tabuleiro
    if (dimensions % 2 !== 0) {
        throw new Error("A dimensão deve ser um número par")
    }

    // array dos emojis posíveis de aparecerem (não necessariamente todos vão)
    const emojis = ['🥔', '🍒', '🥑', '🌽', '🥕', '🍇', '🍉', '🍌', '🥭', '🍍']
    // envia para pickRandom a array de emojis, bem como quantos destes emojis poderão ser selecionados (se há 16 cards, 8 emojis, por exemplo)
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2) 
    // manda picks duas vezes, pois só selecionamos oito da lista de emojis
    const items = shuffle([...picks, ...picks])
    // uma string do board, que usa o método map para criar um card para cada posição na array
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `).join('')}
       </div>
    `
    
    // permite fazer manipulações de DOM com strings em JS, permitindo que o html seja manipulável, ainda que em notação de string (faz isso com cards)
    const parser = new DOMParser().parseFromString(cards, 'text/html')

    // substitui o board do html pelo board dentro de parser (para cards)
    selectors.board.replaceWith(parser.querySelector('.board'))
}

const startGame = () => {
    state.gameStarted = true
    selectors.start.classList.add('disabled')

    // Função de 1 em 1 segundo que atualiza o método selectors
    state.loop = setInterval(() => {
        state.totalTime++

        selectors.moves.innerText = `${state.totalFlips} movimentos`
        selectors.timer.innerText = `Tempo: ${state.totalTime} segundos`
    }, 1000)
}

const flipBackCards = () => {
    // seleciona todas as cards não combinadas que estão viradas para "desvirar" elas (que não possuam matched)
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })

    // número de cards viradas vai a zero
    state.flippedCards = 0
}

// toda vez que o jogador clica para virar uma card
const flipCard = card => {
    state.flippedCards++
    state.totalFlips++

    // se o jogo não iniciou, inicia
    if(!state.gameStarted) {
        startGame()
    }

    // se o número de cartas viradas for menor ou igual a dois, ele vira a carta adicionando a classe flipped
    if(state.flippedCards <= 2) {
        card.classList.add('flipped')
    }

    // caso exista duas cards viradas
    if(state.flippedCards === 2) {
        // pega todas cartas viradas (que não possuam a classe .matched)
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)')

        // se as duas cartas forem iguais, adiciona a classe matched a elas
        if(flippedCards[0].innerText === flippedCards[1].innerText) {
            flippedCards[0].classList.add('matched')
            flippedCards[1].classList.add('matched')
        }

        // depois de um segundo, chama flipBackCards
        setTimeout(() => {
            flipBackCards()
        }, 1000)
    }

    // se não existir mais cartas não viradas
    if(!document.querySelectorAll('.card:not(.flipped)').length) {
        // depois de um segundo, vira o board adicionando a tela de vitória com as informações do objeto
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped')
            selectors.win.innerHTML = `
                <span class="win-text">
                    Você venceu! <br/>
                    com <span class="highlight">${state.totalFlips}</span> movimentos <br/>
                    em <span class="highlight">${state.totalTime}</span> segundos
                </span>
            `

            // limpa o loop
            clearInterval(state.loop)
        }, 1000)
    }
}

const attachEventListeners = () => {
    // captura todo click
    document.addEventListener('click', event => {
        const eventTarget = event.target
        const eventParent = eventTarget.parentElement

        // se o click possui a classe "card" e não possui a classe "flipped" (que indica estar virada), flipCard()
        if(eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent)
        } 
        // se for um botão e ele não estiver com a classe disabled (que o desabilita), start game
        else if(eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame()
        }
    })
}

generateGame()
attachEventListeners()
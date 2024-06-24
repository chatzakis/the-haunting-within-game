async function readFile(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        $('.node-text').append('<p>Error: ' + error.message + '</p>');
        return;
    }

}

function handleCheckpointInterruption(nodeIndex) {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('node')) {
        const node = searchParams.get('node');
        nodeIndex = node;
    }
    return nodeIndex;
}

function handleCheckpointTime(checkpoint, time) {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('node')) {
        time = checkpoint.time;
    }
    return time;
}

function playAudio(source, element, event) {
    const elementClass = element.replace('.', '')
    var $audio = $(`<audio>`, {
        class: elementClass,
        src: source,
        preload: 'auto'
    });

    $(element).append($audio);

    $(element).on(event, function () {
        if ($audio[0].canPlayType('audio/mpeg')) {
            $audio[0].play().catch(function (error) {
                console.error('Audio playback failed:', error);
            });
        } else {
            console.error('Audio format not supported.');
        }
    });
}

function hideNecessary() {
    $(".feedback").hide();
    $(".loader").hide();
}

function updateInventory(inventory, index) {
    inventory.forEach((item) => {
        if (item.nodeAcquired.includes(index)) {
            item.possession = true;
            $('.inventory').append(`<div class="inv-item" id="${item.name}"></div>`)
            $('#' + item.name).css("background-image", `url('./icons/${item.name}.png')`)
        }
    });
    return inventory;
}

function handleDialogHover(CHARACTERS) {
    $(document).ready(function () {
        CHARACTERS.forEach((character) => {
            if (character.name == "protagonist") {
                $('.speech.protagonist').hover(function () {
                    $('.character-box.protagonist').css('background-color', character.color);
                }, function () {
                    $('.character-box.protagonist').css('background-color', 'var(--secontary-transparent)');
                });
            } else {
                $('.' + character.name).hover(function () {
                    $('.character-box.interlocutor').css('background-color', character.color);
                }, function () {
                    $('.character-box.interlocutor').css('background-color', 'var(--secontary-transparent)');
                });
            }
        });
    });
}

function handleDialog(CHARACTERS, text) {
    if (text.search("speech") == -1) {
        $(".protagonist").hide();
        $(".interlocutor").hide();
    } else {
        $(".interlocutor").show();
        if (text.search("protagonist") != -1) { $(".protagonist").show(); }
    }
    CHARACTERS.forEach((character) => {
        if (character.name != "protagonist") {
            if (text.search(character.name) !== -1) {
                $(".interlocutor-img").attr("src", `./images/${character.image}`);
            }
        } else {
            $(".protagonist-img").attr("src", `./images/${character.image}`);
        }
        $('.' + character.name).css("color", `${character.color}`)
    });
}

function handleBackground(img, defaultBg){
    if (img.length !== 0){
        $("body").css('--background-image', `url('../backgrounds/${img}')`);
    }else{
        $("body").css('--background-image', `url('../backgrounds/${defaultBg}')`);
    }
}

function handleNarration(narration){
    $("audio.narration").attr("src", `./sound/narration/${narration}`);
    if (narration.length == 0){
        $(".narration-hint").hide();
    }else{
        $(".narration-hint").show();
    }
}

function printOptions(node) {
    let optionsHtml = '';
    node.options.forEach(option => {
        optionsHtml += `<button class="btn btn-dark opt-btn" data-id="${option.id}" data-target="${option.target}"><b>${option.id}. ${option.text}</b>
         - <span class ='time-remark'>(est. time: <b></span>${option.time}</b> <span class ='time-remark'>min.)</span></button>`;
    });
    $('.option-btns').html(optionsHtml);

    node.options.forEach(option => {
        let $audio = $('<audio>', {
            src: './sound/' + option.sound,
            preload: 'auto'
        });
        $(`.opt-btn[data-id='${option.id}']`).append($audio);
        $(`.opt-btn[data-id='${option.id}']`).on('click', function () {
            if ($audio[0].canPlayType('audio/mpeg')) {
                $audio[0].play().catch(function (error) {
                    console.error('Audio playback failed:', error);
                });
            } else {
                console.error('Audio format not supported.');
            }
        });
    });
    playAudio('./sound/button-hover.wav', '.opt-btn', 'mouseover');
}

function getAnswerForOptions() {
    return new Promise((resolve) => {
        $('.opt-btn').click(function () {
            resolve($(this).data('id'));
        });
    });
}

function makeTimeStep(time, timeElapsed) {
    let randomInterval = Math.ceil((Math.random() + 0.5) * timeElapsed);
    let totalMinutes = time.hours * 60 + time.minutes + randomInterval;

    let newHours = Math.floor(totalMinutes / 60);
    let newMinutes = totalMinutes % 60;

    return {
        hours: newHours,
        minutes: newMinutes
    };
}

function handleTimeInterruptions(index, time, ENDTIME, TIMEOUT) {
    if ((time.hours >= ENDTIME.hours && time.minutes >= ENDTIME.minutes) || time.hours >= 24) {
        if (index == 32 || index == 33) {
            time.hours = 24;
            time.minutes = 0;
        } else {
            // Go to the time-is-up node
            index = TIMEOUT;
            time.hours = ENDTIME.hours;
            time.minutes = ENDTIME.minutes;
        }
    }
    return [index, time];
}

function handleInventoryInterruptions(inventory, index) {
    inventory.forEach((item) => {
        if (item.possession) {
            item.nodeJumps.forEach((jump) => {
                if (jump.use == index) {
                    index = jump.target;
                }
            });
        }
    });
    return index;
}

async function showFeedback(feedback, PAUSETIME) {
    $('.feedback-text').text(`${feedback}`);
    stopNarrationAudio();
    $(".loader-overlay").show();
    $(".time").fadeOut(PAUSETIME / 2);
    if (feedback.length == 0) {
        $(".loader").show();
        await new Promise(resolve => setTimeout(resolve, PAUSETIME));
    } else {
        $(".feedback").show();
        await waitNextPress();
    }
    $(".time").fadeIn(PAUSETIME / 2);
    $(".loader-overlay").hide();
}

function stopNarrationAudio() {
    const audio = document.querySelector("audio.narration"); 
    audio.pause();
    audio.currentTime = 0;
}

function waitNextPress() {
    return new Promise((resolve) => {
        $('.feedback').click(function () {
            resolve();
        });
    });
}


async function main() {
    const nodeFile = "./nodes.json";
    const data = await readFile(nodeFile);

    let nodeIndex = data.initialNode;
    const FINALNODES = data.finalNodes;
    const DEATHNODES = data.deathNodes;
    const CHECKPOINT = data.checkpoint;
    const CHARACTERS = data.characters;
    let time = data.startingTime;
    let inventory = data.inventory;
    const nodes = data.nodes;

    nodeIndex = handleCheckpointInterruption(nodeIndex);
    time = handleCheckpointTime(CHECKPOINT, time)

    playAudio(data.soundtrack, 'body', 'click');
    playAudio(`./sound/narration/node000.mp3`, '.narration', 'click');

    let turns = 0;
    while (true) {
        const currentNode = nodes[nodeIndex];

        hideNecessary();

        inventory = updateInventory(inventory, nodeIndex);
        time.minutes < 10 ? $(".time").text(`${time.hours}:0${time.minutes}`) : $(".time").text(`${time.hours}:${time.minutes}`)

        $('.node-text').empty();
        $('.node-text').append(`<p>${currentNode.text}</p>`);
        handleDialogHover(CHARACTERS);
        handleDialog(CHARACTERS, currentNode.text);
        handleBackground(currentNode.img, data.defaultBackground);
        handleNarration(currentNode.narration);

        $(".option-btns").empty();

        if (DEATHNODES.includes(nodeIndex)) {
            $(".death").show();
        }
        if (FINALNODES.includes(nodeIndex)) {
            $(".play-info").text(`This is one of the ${FINALNODES.length} outcomes of this game. You played ${turns} turns.`)
            $(".replay").show();
            if (nodeIndex > CHECKPOINT.node) { $(".checkpoint-btn").attr("href", `./game.html?node=${CHECKPOINT.node}`); $(".checkpoint-btn").show(); }
            break;
        }

        printOptions(currentNode);

        const answer = await getAnswerForOptions();
        const currentOption = currentNode.options.find(opt => opt.id == answer)

        const timeElapsed = currentOption.time;
        time = makeTimeStep(time, timeElapsed);

        nodeIndex = parseInt(currentOption.target);
        const timeResults = handleTimeInterruptions(nodeIndex, time, data.endTime, data.timeoutNode);
        nodeIndex = timeResults[0];
        time = timeResults[1];
        nodeIndex = handleInventoryInterruptions(inventory, nodeIndex);

        await showFeedback(currentOption.feedback, data.pauseTime);

        turns++;
    }

}

$(document).ready(() => {
    main();
});

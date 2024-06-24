function playAudio(source, element, event) {
    var $audio = $('<audio>', {
        src: source,
        preload: 'auto'
    });

    $(element).append($audio);

    $(element).on(event, function () {
        if ($audio[0].canPlayType('audio/mpeg')) {
            $audio[0].play().catch(function(error) {
                console.error('Audio playback failed:', error);
            });
        } else {
            console.error('Audio format not supported.');
        }
    });
}

$(document).ready(() => {
    playAudio('./sound/horror-ambience.mp3','body', 'click');
    playAudio('./sound/button-hover.wav','.menu-btn', 'mouseover');
    playAudio('./sound/game-start.wav','.play-btn', 'click');
    $(".play-btn").one("click", async function () {
        try {
            console.log("Starting game...");
            await new Promise(resolve => setTimeout(resolve, 600));
            window.location.href = "file:///C:/Users/micha/Desktop/cmd-game/game.html";
        } catch (error) {
            console.error('An error occurred:', error);
        }
    });
});

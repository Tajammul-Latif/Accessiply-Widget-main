export function toggleAudio(disable) {
  const audioElements = document.querySelectorAll('audio');

  audioElements.forEach(audio => {
    if (disable) {
      audio.pause();
      audio.muted = true;
    } else {
      audio.muted = false;
      audio.play();
    }
  });
}

(function ($) {
  "use strict";

  const canvas = document.getElementById("pongCanvas");
  const ctx = canvas.getContext("2d");

  let isPlaying = false, scoreL = 0, scoreR = 0, ballAngle = 0;
  let ballX = 300, ballY = 200, ballSpeedX = 5, ballSpeedY = 3;
  const ballSize = 12, paddleW = 12, paddleH = 80, paddleSpeed = 6;
  let paddleLY = 160, paddleRY = 160;

  const input = { p1Up: false, p1Down: false, p2Up: false, p2Down: false };

  const calculateAngle = () => {
    let radians = Math.atan2(ballSpeedY, ballSpeedX),
      degrees = radians * (180 / Math.PI);
    if (degrees < 0) degrees += 360;
    ballAngle = Math.round(degrees);
  };

  const resetBall = (dir) => {
    ballX = 300;
    ballY = 200;
    ballSpeedX = dir * 5;
    ballSpeedY = (Math.random() * 2 - 1) * 3;
    calculateAngle();
  };

  const checkMatchEnd = () => {
    if (scoreL >= 5 || scoreR >= 5) {
      isPlaying = false;
      $("#winnerText")
        .text(scoreL >= 5 ? "PLAYER 1 WIN!" : "PLAYER 2 WIN!")
        .css("color", "#00ffcc");
      $("#gameOverScreen").show();
    }
  };

  const update = () => {
    if (!isPlaying) return;

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY < 0 || ballY + ballSize > 400) {
      ballSpeedY = -ballSpeedY;
      calculateAngle();
    }

    if (input.p1Up && paddleLY > 0) paddleLY -= paddleSpeed;
    if (input.p1Down && paddleLY < 400 - paddleH) paddleLY += paddleSpeed;
    if (input.p2Up && paddleRY > 0) paddleRY -= paddleSpeed;
    if (input.p2Down && paddleRY < 400 - paddleH) paddleRY += paddleSpeed;

    if (ballSpeedX < 0) {
      if (
        ballX < 20 + paddleW &&
        ballY + ballSize > paddleLY &&
        ballY < paddleLY + paddleH
      ) {
        let hit = ballY + ballSize / 2 - (paddleLY + paddleH / 2);
        ballSpeedY = hit * 0.12;
        ballSpeedX = Math.min(15, -ballSpeedX * 1.1);
        calculateAngle();
      }
    }

    if (ballSpeedX > 0) {
      if (
        ballX + ballSize > 600 - 20 - paddleW &&
        ballY + ballSize > paddleRY &&
        ballY < paddleRY + paddleH
      ) {
        let hit = ballY + ballSize / 2 - (paddleRY + paddleH / 2);
        ballSpeedY = hit * 0.12;
        ballSpeedX = Math.max(-15, -ballSpeedX * 1.1);
        calculateAngle();
      }
    }

    if (ballX < 0) {
      scoreR++;
      resetBall(1);
      checkMatchEnd();
    } else if (ballX > 600) {
      scoreL++;
      resetBall(-1);
      checkMatchEnd();
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, 600, 400);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(300, 0);
    ctx.lineTo(300, 400);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = '40px "DotGothic16"';
    ctx.textAlign = "center";
    ctx.fillText(scoreL, 150, 70);
    ctx.fillText(scoreR, 450, 70);

    $("#statAngle").text(`${ballAngle}°`);

    ctx.fillRect(20, paddleLY, paddleW, paddleH);
    ctx.fillRect(600 - 20 - paddleW, paddleRY, paddleW, paddleH);

    if (isPlaying) {
      ctx.fillStyle = "#ffff00";
      ctx.fillRect(ballX, ballY, ballSize, ballSize);
    }
  };

  const loop = () => {
    update();
    draw();
    requestAnimationFrame(loop);
  };

  const handleTouch = (e) => {
    if (!isPlaying) return;
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const scaleX = 600 / rect.width;
    const scaleY = 400 / rect.height;

    const touches = e.originalEvent.touches;

    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const touchX = (touch.clientX - rect.left) * scaleX;
      const touchY = (touch.clientY - rect.top) * scaleY;

      const targetY = touchY - paddleH / 2;
      const clampedY = Math.max(0, Math.min(400 - paddleH, targetY));

      if (touchX < 300) {
        paddleLY = clampedY;
      } else {
        paddleRY = clampedY;
      }
    }
  };

  $(() => {
    $(document)
      .on("keydown", (e) => {
        if (e.key === "w" || e.key === "W") input.p1Up = true;
        if (e.key === "s" || e.key === "S") input.p1Down = true;
        if (e.key === "ArrowUp") input.p2Up = true;
        if (e.key === "ArrowDown") input.p2Down = true;
      })
      .on("keyup", (e) => {
        if (e.key === "w" || e.key === "W") input.p1Up = false;
        if (e.key === "s" || e.key === "S") input.p1Down = false;
        if (e.key === "ArrowUp") input.p2Up = false;
        if (e.key === "ArrowDown") input.p2Down = false;
      });

    $(canvas).on("touchstart touchmove", handleTouch);

    $("#startBtn").on("click", function (e) {
      e.preventDefault();
      $("#startScreen").hide();
      isPlaying = true;
      resetBall(1);
    });

    $("#restartBtn").on("click", function (e) {
      e.preventDefault();
      $("#gameOverScreen").hide();
      scoreL = 0;
      scoreR = 0;
      isPlaying = true;
      resetBall(1);
    });

    calculateAngle();
    loop();
  });
})(jQuery);

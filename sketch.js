// Hand Pose Detection with ml5.js
  // https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

  let video;
  let handPose;
  let hands = [];
  let boxX, boxY, boxSize = 100;
  let isDragging = false;
  let bgVideo;

  function preload() {
    handPose = ml5.handPose({ flipped: true });
    // 不要在這裡 createVideo
  }

  function mousePressed() {
    console.log(hands);
  }

  function gotHands(results) {
    hands = results;
  }

  let questions = [
    {
      q: "淡江大學教育科技系的英文縮寫是？",
      options: ["TKUCS", "TKUET", "TKUBUS"],
      answer: 1
    },
    {
      q: "下列哪一項是教育科技系常見課程？",
      options: ["數位學習設計", "機械製造", "會計學"],
      answer: 0
    },
    {
      q: "教育科技系學生常用哪種工具？",
      options: ["Photoshop", "AutoCAD", "SolidWorks"],
      answer: 0
    }
  ];

  let currentQ = 0;
  let feedback = "";
  let feedbackColor = [0, 0, 0];
  let optionBoxes = [];

  function setup() {
    createCanvas(1280, 960); // 畫布放大兩倍
    video = createCapture(VIDEO, { flipped: true });
    video.size(640, 480);
    video.hide();
    handPose.detectStart(video, gotHands);

    // 影片在 setup() 建立，檔名請改成你的影片檔名
    bgVideo = createVideo(['hou.mp4']);
    bgVideo.hide();
    bgVideo.loop();
    bgVideo.volume(0);
    bgVideo.autoplay(true); // 新增這行
    bgVideo.play();

    // 讓題目與選項區塊整體置中
    let boxW = 400, boxH = 50;
    let totalHeight = 80 + 40 + (boxH + 20) * 3; // 題目區+間距+三個選項
    let startY = (height - totalHeight) / 2 + 80; // 80為題目區高度

    optionBoxes = [];
    for (let i = 0; i < 3; i++) {
      optionBoxes.push({
        x: width / 2 - boxW / 2,
        y: startY + i * (boxH + 20),
        w: boxW,
        h: boxH
      });
    }
  }

  function draw() {
    scale(2.0); // 畫面放大兩倍
    // 下面所有繪圖內容不用改
    // 將視訊畫面放大200%並置中顯示
    let scale = 2.0;
    let videoW = video.width * scale;
    let videoH = video.height * scale;
    let videoX = (width - videoW) / 2;
    let videoY = (height - videoH) / 2;
    background(0); // 黑色背景
    image(video, videoX, videoY, videoW, videoH);

    // 題目區塊置中
    let questionBoxW = 520, questionBoxH = 70;
    let questionBoxX = width / 2 - questionBoxW / 2;
    let questionBoxY = 60;
    fill(255);
    stroke(180);
    strokeWeight(2);
    rect(questionBoxX, questionBoxY, questionBoxW, questionBoxH, 16);
    noStroke();
    fill(30);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(questions[currentQ].q, width / 2, questionBoxY + questionBoxH / 2);

    // 選項區塊
    textSize(20);
    let boxW = 400, boxH = 50;
    let startY = questionBoxY + questionBoxH + 36;
    for (let i = 0; i < 3; i++) {
      let box = optionBoxes[i];
      // hover 效果
      let isHover = false;
      if (hands.length > 0) {
        let hand = hands[0];
        if (hand.confidence > 0.1) {
          let indexFinger = hand.keypoints[8];
          // 乘上 2.0 讓座標對齊放大後的畫面
          let fingerX = indexFinger.x * 2.0;
          let fingerY = indexFinger.y * 2.0;
          if (
            fingerX > box.x &&
            fingerX < box.x + box.w &&
            fingerY > box.y &&
            fingerY < box.y + box.h
          ) {
            isHover = true;
            fill(0, 120, 255);
            noStroke();
            circle(fingerX, fingerY, 22);

            // 只在沒有回饋時才判斷答案
            if (feedback === "") {
              if (i === questions[currentQ].answer) {
                feedback = "答對了！";
                feedbackColor = [0, 180, 0];
              } else {
                feedback = "答錯囉！";
                feedbackColor = [200, 0, 0];
              }
              setTimeout(() => {
                feedback = "";
                currentQ = (currentQ + 1) % questions.length;
              }, 1200);
            }
          }
        }
      }
      fill(isHover ? [180, 220, 255] : 240);
      stroke(isHover ? [80, 160, 255] : 200);
      strokeWeight(isHover ? 3 : 1);
      rect(box.x, box.y, box.w, box.h, 12);
      noStroke();
      fill(30);
      text(questions[currentQ].options[i], box.x + box.w / 2, box.y + box.h / 2);
    }

    // 回饋訊息
    if (feedback !== "") {
      textSize(28);
      fill(feedbackColor);
      text(feedback, width / 2, startY + boxH * 3 + 40);
    }
  }

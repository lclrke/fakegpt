let input, messageArea, sendButton;
let buttons = [];
let messages = [];
let introMessage = "Hello, I'm your data assistant! Need help understanding your artist's data in the dashboard? Ask away!";
let grayColor, darkGrayColor;
let customFont, sendIcon, wavoLogo;
let responses = [];
let usedResponses = [];
let messageCount = 0;

let widgetWidth = 360;
let widgetHeight = 830;

// Fallback responses in case external file doesn't load
const fallbackResponses = [
  "That's a great question, you're absolutely right to question that! There's a graph 5 pixels to the left, did you try using your eyes?",
  "Can definitley help with that! Amazing you've gone this far in your industry without understanding graphs!",
  "I know the answer obviously, but if this is how you handle data, I'm not sure how you're handling your artists.",
  "Hmmm, shouldn't you understand how to read marketing data if it's your job?"
];

function preload() {
  customFont = loadFont('assets/IBMPlexSans-Regular.ttf');
  
  sendIcon = loadImage('assets/send.svg', 
    () => console.log('Send icon loaded'), 
    () => console.log('Send icon failed to load')
  );
  
  wavoLogo = loadImage('assets/wavologo.png', 
    () => console.log('Logo loaded'), 
    () => console.log('Logo failed to load')
  );
  
  loadStrings('assets/responses.txt', 
    (data) => {
      responses = data;
      console.log('Responses loaded:', responses.length);
    },
    () => {
      console.log('Using fallback responses');
      responses = fallbackResponses;
    }
  );
}

function setup() {
  let canvas = createCanvas(widgetWidth, widgetHeight);
  // Don't specify parent - let it attach to body by default
  
  grayColor = color(240);
  darkGrayColor = color(200);

  textFont(customFont);

  // Create message area
  messageArea = createElement('div');
  messageArea.style('font-family', 'IBM Plex Sans, Arial, sans-serif');
  messageArea.style('font-size', '14px');
  messageArea.style('overflow-y', 'scroll');
  messageArea.style('background-color', 'white');
  messageArea.style('padding', '10px');
  messageArea.style('border-radius', '10px');
  messageArea.style('position', 'absolute');
  messageArea.style('top', '70px');
  messageArea.style('left', '10px');
  messageArea.style('width', (widgetWidth - 20) + 'px');
  messageArea.style('height', (widgetHeight - 150) + 'px');
  messageArea.style('box-sizing', 'border-box');
  messageArea.style('z-index', '10');

  // Create input
  input = createInput('');
  input.style('background-color', '#f0f0f0');
  input.style('border', 'none');
  input.style('border-radius', '15px');
  input.style('padding', '5px 15px');
  input.style('font-family', 'IBM Plex Sans, Arial, sans-serif');
  input.attribute('placeholder', 'Type message here');
  input.style('position', 'absolute');
  input.style('bottom', '10px');
  input.style('left', '10px');
  input.style('width', (widgetWidth - 95) + 'px');
  input.style('height', '30px');
  input.style('box-sizing', 'border-box');
  input.style('z-index', '10');

  // Create send button
  sendButton = createButton('');
  sendButton.style('background-color', 'transparent');
  sendButton.style('border', 'none');
  sendButton.style('cursor', 'pointer');
  sendButton.mousePressed(handleUserInput);
  sendButton.style('position', 'absolute');
  sendButton.style('bottom', '10px');
  sendButton.style('right', '10px');
  sendButton.style('width', '40px');
  sendButton.style('height', '30px');
  sendButton.style('z-index', '10');

  // Create preset buttons
  let buttonLabels = [
    "Where are my\nSuper Fans?",
    "Show me my best\nand worst social posts.",
    "Help me reach\nmore people with my organic content.",
    "How can you help me\npromote my artist roster?"
  ];

  for (let i = 0; i < 4; i++) {
    let btn = createButton(buttonLabels[i]);
    btn.style('border', '1px solid #ccc');
    btn.style('background-color', 'white');
    btn.style('border-radius', '10px');
    btn.style('font-family', 'IBM Plex Sans, Arial, sans-serif');
    btn.style('font-size', '12px');
    btn.style('padding', '5px');
    btn.style('text-align', 'center');
    btn.style('position', 'absolute');
    btn.style('left', (10 + (i % 2) * 175) + 'px');
    btn.style('top', (260 + Math.floor(i / 2) * 90) + 'px');
    btn.style('width', '165px');
    btn.style('height', '80px');
    btn.style('box-sizing', 'border-box');
    btn.style('z-index', '10');
    btn.mousePressed(() => handleButtonClick(buttonLabels[i]));
    buttons.push(btn);
  }

  if (responses.length === 0) {
    responses = fallbackResponses;
  }

  updateMessageArea();
}

function draw() {
  clear();
  fill(255);
  stroke(darkGrayColor);
  strokeWeight(1);
  rect(0, 0, widgetWidth, widgetHeight);

  noStroke();
  fill(grayColor);
  rect(0, 0, widgetWidth, 60);

  // Draw logo (with fallback if image didn't load)
  if (wavoLogo && wavoLogo.width > 0) {
    image(wavoLogo, 15, 10, 40, 40);
  } else {
    // Fallback: simple circle with W
    fill(74, 144, 226);
    ellipse(35, 30, 40, 40);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("W", 35, 30);
  }

  // Header text
  textAlign(LEFT, BASELINE);
  textFont(customFont);
  fill(0);
  textSize(16);
  text("Audience Dashboard Assistant", 65, 30);
  textSize(12);
  fill(100);
  text("Your Data Assistant", 65, 48);

  // Draw send icon (with fallback if image didn't load)
  if (sendIcon && sendIcon.width > 0) {
    image(sendIcon, widgetWidth - 50, widgetHeight - 35, 25, 25);
  } else {
    // Fallback: simple arrow
    stroke(100);
    strokeWeight(2);
    line(widgetWidth - 45, widgetHeight - 22, widgetWidth - 30, widgetHeight - 22);
    line(widgetWidth - 35, widgetHeight - 27, widgetWidth - 30, widgetHeight - 22);
    line(widgetWidth - 35, widgetHeight - 17, widgetWidth - 30, widgetHeight - 22);
    noStroke();
  }
}

function keyPressed() {
  if (keyCode === ENTER) {
    handleUserInput();
  }
}

function pickUniqueResponse() {
  if (responses.length === usedResponses.length) usedResponses = [];
  let availableResponses = responses.filter(r => !usedResponses.includes(r));
  let response = random(availableResponses);
  usedResponses.push(response);
  return response;
}

function handleUserInput() {
  let userMessage = input.value();
  if (userMessage.trim() !== '') {
    showMessage(userMessage, true);
    input.value('');
  }
}

function handleButtonClick(buttonText) {
  showMessage(buttonText, true);
  hideButtons();
}

function showMessage(msg, isUser) {
  messageCount++;
  if (messageCount > 5) {
    showCreditLimitMessage();
  } else {
    let response = isUser ? pickUniqueResponse() : msg;
    let formattedMsg = isUser ? 
      `<span style="color: #888">You asked: ${msg}</span><br>${response}` : 
      response;
    addMessage(formattedMsg);
  }
}

function hideButtons() {
  buttons.forEach(btn => btn.style('display', 'none'));
}

function showCreditLimitMessage() {
  let creditMsg = "Sorry, you have reached your credit limit! Subscribe to Wavo Plus if you are seeing this message too often";
  let formattedMsg = `<span style="color: red;">${creditMsg}</span>`;
  addMessage(formattedMsg);
}

function addMessage(msg) {
  messages.push(msg);
  updateMessageArea();
}

function updateMessageArea() {
  let content = messages.length > 0 ? messages.join('<br><br>') : introMessage;
  messageArea.html(content);
  messageArea.elt.scrollTop = messageArea.elt.scrollHeight;
}

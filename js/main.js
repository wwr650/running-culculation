// 全局变量
let trackLength_g = 400;
let animationId = null;
let startTime = null;
let lastTime = null;
let isPaused = false;
let pauseTime = 0;
let totalPausedTime = 0;
let startPosition = 0;

// 跑步者数据
const runners = {
    runner1: { speed: null, distance: 0, element: null, infoElement: null, speedElement: null,
        quarter_kilometer: null, five_kilometer: null, half_marathon: null, full_marathon: null},
    runner2: { speed: null, distance: 0, element: null, infoElement: null, speedElement:null,
        quarter_kilometer: null, five_kilometer: null, half_marathon: null, full_marathon: null},
    apart: null
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    runners.runner1.element = document.getElementById('runner1');
    runners.runner2.element = document.getElementById('runner2');
    runners.runner1.speedElement = document.getElementById('speed-1');
    runners.runner2.speedElement = document.getElementById('speed-2');
    runners.runner1.quarter_kilometer = document.getElementById('quarter-kilometer-1');
    runners.runner2.quarter_kilometer = document.getElementById('quarter-kilometer-2');
    runners.runner1.five_kilometer = document.getElementById('five-kilometer-1');
    runners.runner2.five_kilometer = document.getElementById('five-kilometer-2');
    runners.runner1.half_marathon = document.getElementById('half-marathon-1');
    runners.runner2.half_marathon = document.getElementById('half-marathon-2');
    runners.runner1.full_marathon = document.getElementById('full-marathon-1');
    runners.runner2.full_marathon = document.getElementById('full-marathon-2');
    runners.runner1.infoElement = document.getElementById('info1');
    runners.runner2.infoElement = document.getElementById('info2');
    runners.apart = document.getElementById('info3');


    // 设置初始位置
    resetAnimation();
});

//速度初始化
function speed_initialization(){
    const runner1_speed_min = parseInt(document.getElementById('runner1Speed-min').value);
    const runner1_speed_s = parseInt(document.getElementById('runner1Speed-s').value);
    const runner2_speed_min = parseInt(document.getElementById('runner2Speed-min').value);
    const runner2_speed_s = parseInt(document.getElementById('runner2Speed-s').value);
    runners.runner1.speed = 1000 / (runner1_speed_min * 60 + runner1_speed_s);
    runners.runner2.speed = 1000 / (runner2_speed_min * 60 + runner2_speed_s);
    // 验证输入
    if (runners.runner1.speed <= 0 || runners.runner2.speed <= 0) {
        alert("请输入有效的数值！");
        return;
    }
    // 显示速度
    runners.runner1.speedElement.textContent =
        `${runners.runner1.speed.toFixed(1)}米/秒`;
    runners.runner2.speedElement.textContent =
        `${runners.runner2.speed.toFixed(1)}米/秒`;
}
function startAnimation() {
    if (animationId) {
        if (isPaused) {
            // 从暂停状态恢复
            totalPausedTime += (performance.now() - pauseTime);
            isPaused = false;
            lastTime = performance.now();
            animate();
        }
        return;

    }


    const trackLength = trackLength_g;

    //速度初始化
    speed_initialization();

    // 获取输入值
    startPosition = parseFloat(document.getElementById('startPosition').value);

    // 验证输入
    if (trackLength <= 0 || startPosition < 0) {
        alert("请输入有效的数值！");
        return;
    }

    // 设置初始距离
    runners.runner1.distance = 0;
    runners.runner2.distance = startPosition;

    // 更新初始位置
    updateRunnerPositions(trackLength);

    // 开始动画
    startTime = performance.now();
    lastTime = startTime;
    totalPausedTime = 0;
    isPaused = false;
    animate();
}

function animate() {
    if (isPaused) return;

    const currentTime = performance.now();
    const elapsedTime = (currentTime - startTime - totalPausedTime) / 1000; // 转换为秒

    // 更新显示的时间
    document.getElementById('timeDisplay').textContent = elapsedTime.toFixed(2);

    // 获取跑道长度
    const trackLength = trackLength_g;

    // 计算跑步者跑过的距离
    runners.runner1.distance = runners.runner1.speed * elapsedTime;
    runners.runner2.distance = runners.runner2.speed * elapsedTime + startPosition;

    // 更新跑步者位置
    updateRunnerPositions(trackLength);

    // 更新跑步者信息
    updateRunnerInfo(trackLength);

    // 继续动画
    animationId = requestAnimationFrame(animate);
}

function pauseAnimation() {
    if (!isPaused && animationId) {
        isPaused = true;
        pauseTime = performance.now();
    }
}

function resetAnimation() {
    // 停止动画
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    // 重置状态
    isPaused = false;
    startTime = null;
    lastTime = null;
    pauseTime = 0;
    totalPausedTime = 0;

    // 重置跑步者位置
    runners.runner1.distance = 0;
    runners.runner2.distance = parseFloat(document.getElementById('startPosition').value) || 0;

    // 获取跑道长度
    const trackLength = trackLength_g;

    // 更新位置和信息
    updateRunnerPositions(trackLength);
    updateRunnerInfo(trackLength);

    // 重置时间显示
    document.getElementById('timeDisplay').textContent = "0.00";
}

function calculatePosition(realposition,length,height,radius){
    let x;
    let y;
    let angle;
    const STRAIGHT_SEGMENT = 84.39;   // 直道分段长度
    const CURVE_SEGMENT = 114.61;     // 弯道分段长度
    const PI = Math.PI;      // 半圆对应角度
    if (realposition <= STRAIGHT_SEGMENT){
        x = realposition/STRAIGHT_SEGMENT*length
        y = 0
    }
    else if (realposition <= STRAIGHT_SEGMENT + CURVE_SEGMENT){
        angle = (realposition - STRAIGHT_SEGMENT) / CURVE_SEGMENT * PI;
        x = length + radius * Math.cos(angle - PI / 2);
        y = radius + radius * Math.sin(angle - PI / 2);
    }
    else if (realposition <= CURVE_SEGMENT + STRAIGHT_SEGMENT * 2){
        x = length - ((realposition - STRAIGHT_SEGMENT - CURVE_SEGMENT) / STRAIGHT_SEGMENT * length)
        y = height
    }
    else {
        angle = (realposition - (CURVE_SEGMENT + STRAIGHT_SEGMENT * 2)) / CURVE_SEGMENT * PI;
        x = radius * Math.cos(angle + PI / 2);
        y = radius + radius * Math.sin(angle + PI / 2);
    }
    // console.log(length)
    return {
        x : x,
        y : y
    };
}
function updateRunnerPositions(trackLength) {
    const element = document.querySelector(".runway1");
    const computedStyle = window.getComputedStyle(element);
    const runway_width = computedStyle.width; 
    const runway_radius = computedStyle.borderRadius;
    const runway_height = computedStyle.height;
    // 提取数值部分
    const runway_widthValue = parseFloat(runway_width);
    const runway_radiusValue = parseFloat(runway_radius);
    const runway_heightValue = parseFloat(runway_height);
    const length = runway_widthValue - runway_radiusValue * 2;
    const trackHeight = runway_heightValue;
    const radius = runway_radiusValue;

    // 计算在跑道上的位置
    const position1 = runners.runner1.distance;
    const position2 = runners.runner2.distance;
    const position1_calculation = position1 - 400*parseInt(position1/400);
    const position2_calculation = position2 - 400*parseInt(position2/400);
    // 更新跑者位置
    const {x:x1,y:y1} = calculatePosition(position1_calculation,length,trackHeight,radius)
    runners.runner1.element.style.transform = `translate(${x1}px, ${y1}px)`;
    const {x:x2,y:y2} = calculatePosition(position2_calculation,length,trackHeight,radius)
    runners.runner2.element.style.transform = `translate(${x2}px, ${y2}px)`;
}

function updateRunnerInfo(trackLength) {
    const laps1 = Math.floor(runners.runner1.distance / trackLength);
    const laps2 = Math.floor(runners.runner2.distance / trackLength);
    const distance = runners.runner1.distance - runners.runner2.distance;

    runners.apart.textContent = `A距离B：${distance.toFixed(1)}米`
    runners.runner1.infoElement.textContent =
        `A: ${runners.runner1.distance.toFixed(1)}米 (${laps1}圈)`;
    runners.runner2.infoElement.textContent =
        `B: ${runners.runner2.distance.toFixed(1)}米 (${laps2}圈)`;
}

//时间格式化
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);

    return `${hours}小时 ${minutes}分 ${secs}秒`;
}

function calculate() {
    // 获取输入值
    const trackLength = trackLength_g;
    const startPosition = parseFloat(document.getElementById('startPosition').value);

    //速度初始化
    speed_initialization();
    const runner1Speed = runners.runner1.speed;
    const runner2Speed = runners.runner2.speed;

    // 验证输入
    if (trackLength <= 0 || startPosition < 0) {
        alert("请输入有效的数值！");
        return;
    }

    //计算用时
    const quarter_kilometer = 400;
    const five_kilometer = 5000;
    const half_marathon = 21097.5;
    const full_marathon = 42195;
    const runner1_quarter_kilometer = quarter_kilometer / runner1Speed;
    runners.runner1.quarter_kilometer.textContent = formatTime(runner1_quarter_kilometer);
    const runner1_five_kilometer = five_kilometer / runner1Speed;
    runners.runner1.five_kilometer.textContent = formatTime(runner1_five_kilometer);
    const runner1_half_marathon = half_marathon / runner1Speed;
    runners.runner1.half_marathon.textContent = formatTime(runner1_half_marathon);
    const runner1_full_marathon = full_marathon / runner1Speed;
    runners.runner1.full_marathon.textContent = formatTime(runner1_full_marathon);
    const runner2_quarter_kilometer = quarter_kilometer / runner2Speed;
    runners.runner2.quarter_kilometer.textContent = formatTime(runner2_quarter_kilometer);
    const runner2_five_kilometer = five_kilometer / runner2Speed;
    runners.runner2.five_kilometer.textContent = formatTime(runner2_five_kilometer);
    const runner2_half_marathon = half_marathon / runner2Speed;
    runners.runner2.half_marathon.textContent = formatTime(runner2_half_marathon);
    const runner2_full_marathon = full_marathon / runner2Speed;
    runners.runner2.full_marathon.textContent = formatTime(runner2_full_marathon);

    // 计算追及时间
    let timeToCatch;
    let resultText = "";

    if (runner1Speed > runner2Speed && startPosition > 0) {
        // A比B快，A会追上B
        const relativeSpeed = runner1Speed - runner2Speed;
        timeToCatch = startPosition / relativeSpeed;
        const laps = (runner1Speed * timeToCatch) / trackLength;

        resultText = `
                    <h3>计算结果</h3>
                    <p>跑步者A将在 <strong>${timeToCatch.toFixed(2)} 秒</strong> 后追上跑步者B。</p>
                    <p>此时A已经跑了 <strong>${(runner1Speed * timeToCatch).toFixed(2)} 米</strong> (约 ${laps.toFixed(2)} 圈)。</p>
                    <p>B已经跑了 <strong>${(runner2Speed * timeToCatch).toFixed(2)} 米</strong> (约 ${(runner2Speed * timeToCatch / trackLength).toFixed(2)} 圈)。</p>
                `;
    } else if (runner1Speed < runner2Speed) {
        // B比A快，B会拉开距离
        const relativeSpeed = runner2Speed - runner1Speed;
        timeToCatch = (trackLength - startPosition) / relativeSpeed;
        const laps = (runner2Speed * timeToCatch) / trackLength;

        resultText = `
                    <h3>计算结果</h3>
                    <p>跑步者B比A快，不会被A追上。</p>
                    <p>B将在 <strong>${timeToCatch.toFixed(2)} 秒</strong> 后比A多跑完一整圈。</p>
                    <p>此时B已经跑了 <strong>${(runner2Speed * timeToCatch).toFixed(2)} 米</strong> (约 ${laps.toFixed(2)} 圈)。</p>
                    <p>A已经跑了 <strong>${(runner1Speed * timeToCatch).toFixed(2)} 米</strong> (约 ${(runner1Speed * timeToCatch / trackLength).toFixed(2)} 圈)。</p>
                `;
    } else if (runner1Speed === runner2Speed) {
        // 速度相同
        resultText = `
                    <h3>计算结果</h3>
                    <p>两人速度相同，保持初始距离不变。</p>
                    <p>跑步者B将一直在跑步者A前方 ${startPosition} 米处。</p>
                `;
    }
    else if (runner1Speed > runner2Speed && startPosition === 0) {
        // A比B快，且同一起跑线，A会追上B
        resultText = `
                    <h3>计算结果</h3>
                    <p>两者同一起跑线起跑</p>
                    <p>跑步者A将一直在跑步者B前方</p>
                `;
    }

    // 显示结果
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = resultText;
    resultDiv.style.display = 'block';
}
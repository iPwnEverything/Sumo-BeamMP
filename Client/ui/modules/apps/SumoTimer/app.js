angular.module('beamng.apps')
.directive('sumoTimer', ['CanvasShortcuts','$timeout', function (CanvasShortcuts, $timeout) {
    return {
        template: `
            <div id="sumoApp" style="max-height:100%; width:100%; margin:0px; background:transparent;" layout="row" layout-align="center left" layout-wrap>        
                <div id="circleCanvasDiv" style="position:absolute; marginTop:0; marginLeft:0; width:100%; height:100%;">
                    <canvas id="circleCanvas" style="width:100%; height:100%;" width="500" height="500"></canvas>
                </div>
            </div>
        `,
        replace: true,
        restrict: 'EA',
        link: function (scope, element, attrs) {
            var streamsList = ['Sumo'];
            var endTime = '30';
            StreamsManager.add(streamsList);
            scope.$on('$destroy', function () {
                StreamsManager.remove(streamsList);
            });
            
            function saveScopeDataToLocalStorage() {
                localStorage.setItem('endTime', scope.endTime);
            }
            
            function updateTime() {
                time += 0.01;
                updateSector();
                if (time > endTime) {
                    resetTime();
                }
            }

            function resetTime() {
                time = 0;
                fillColor = 'white';
                endAngle = 1.5001 * Math.PI;
            }

            function syncTime(luatime) {
                time = luatime;
                if (time > 0.75 * endTime) {
                    fillColor = 'red';
                } else {
                    fillColor = 'white';
                }
            }

            function startTimer() {
                // clearInterval(timerID)
                timerID = setInterval(updateTime, 10);
            }

            function removeTimer() {
                clearInterval(timerID);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                resetTime();
                updateTime();
            }

            function updateSector() {
                canvas = document.getElementById('circleCanvas');
                ctx = canvas.getContext('2d');
                let x = canvas.width / 2;
                let y = canvas.height / 2;
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing

                function drawCircle() {
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, 2 * Math.PI, counterClockwise);
                    ctx.fillStyle = 'black';
                    ctx.fill();
                }

                function drawSector() {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.arc(x, y, radius + 1, startAngle, endAngle, counterClockwise);
                    ctx.lineTo(x, y);
                    ctx.fillStyle = fillColor;
                    ctx.fill();
                }

                let endAngle = startAngle + (2 * Math.PI * (time/endTime));
                let radius = 200;
                let counterClockwise = false;
                if (time > 0.75 * endTime) {
                    fillColor = 'red';
                }
                drawCircle();
                drawSector();
                // startTimer
                // if (endAngle > startAngle && endAngle < startAngle + 2 * Math.PI) {
                //     requestAnimationFrame(updateTime);
                // }
            }
            
            var time = 0;
            var startAngle = 1.5 * Math.PI;
            var timerID;
            var fillColor = 'white';
            var canvas;
            var ctx;

            // Wait for the DOM to be fully loaded
            document.addEventListener('DOMContentLoaded', function() {
                // Wrap canvas initialization inside $timeout to ensure it runs after the DOM is loaded
                canvas = document.getElementById('circleCanvas');
                if (!canvas) {
                    console.error("Canvas element not found.");
                    return;
                }

                updateTime();
            });

            scope.$on('VehicleChange', function (event, data) {
            });
            
            scope.$on('sumoStartTimer', function (event, data) {
                console.log(data);
                endTime = data;
                saveScopeDataToLocalStorage();
                startTimer();
                scope.$apply();
            });   

            scope.$on('sumoRemoveTimer', function (event, data) {
                removeTimer();
                // startTimer();
                // scope.$apply();
            });

            scope.$on('sumoSyncTimer', function (event, data) {
                syncTime(data);
                // startTimer();
                // scope.$apply();
            });

            scope.$on('app:resized', function (event, data) {
                // c.width = data.width;
                // c.height = data.height;
            });
        }
    };
}]);
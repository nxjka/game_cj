// 搜索功能实现
document.addEventListener('DOMContentLoaded', function() {
    SearchHistory.init();
    
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    searchBtn.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            SearchHistory.addRecord(query);
            window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(query)}`, '_blank');
            searchInput.value = '';
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                SearchHistory.addRecord(query);
                window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(query)}`, '_blank');
                searchInput.value = '';
            }
        }
    });
    
    // 点击搜索框显示历史记录
    searchInput.addEventListener('focus', function() {
        SearchHistory.renderHistory();
    });
    
    // 可选：添加快捷搜索菜单
    const searchEngineMenu = document.createElement('div');
    searchEngineMenu.id = 'search-engine-menu';
    searchEngineMenu.style.display = 'none';
    searchEngineMenu.style.position = 'absolute';
    searchEngineMenu.style.backgroundColor = 'white';
    searchEngineMenu.style.border = '1px solid #ddd';
    searchEngineMenu.style.borderRadius = '4px';
    searchEngineMenu.style.padding = '5px';
    searchEngineMenu.style.zIndex = '1000';
    
    const engines = [
        { name: '百度', url: 'https://www.baidu.com/s?wd=' },
        { name: 'Google', url: 'https://www.google.com/search?q=' },
        { name: 'Bing', url: 'https://www.bing.com/search?q=' },
        { name: 'GitHub', url: 'https://github.com/search?q=' },
        { name: '维基百科', url: 'https://zh.wikipedia.org/w/index.php?search=' }
    ];
    
    engines.forEach(engine => {
        const option = document.createElement('div');
        option.textContent = engine.name;
        option.style.padding = '5px';
        option.style.cursor = 'pointer';
        option.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                window.open(engine.url + encodeURIComponent(query), '_blank');
            }
            searchEngineMenu.style.display = 'none';
        });
        searchEngineMenu.appendChild(option);
    });
    
    document.body.appendChild(searchEngineMenu);
    
    // 点击搜索框显示引擎菜单
    searchInput.addEventListener('focus', function() {
        const rect = searchInput.getBoundingClientRect();
        searchEngineMenu.style.display = 'block';
        searchEngineMenu.style.top = (rect.bottom + window.scrollY) + 'px';
        searchEngineMenu.style.left = rect.left + 'px';
    });
    
    // 点击其他地方隐藏菜单
    document.addEventListener('click', function(e) {
        if (e.target !== searchInput && e.target !== searchEngineMenu) {
            searchEngineMenu.style.display = 'none';
        }
    });

    


});

// 搜索记录功能
const SearchHistory = {
    init: function() {
        this.history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        this.renderHistory();
        
        document.getElementById('clear-search-btn').addEventListener('click', () => {
            this.clearHistory();
        });
    },
    
    addRecord: function(query) {
        const record = {
            query: query,
            time: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/\//g, '-')
        };
        
        // 避免重复记录
        if (!this.history.some(item => item.query === query)) {
            this.history.unshift(record);
            // 最多保存10条记录
            if (this.history.length > 10) {
                this.history.pop();
            }
            this.saveHistory();
            this.renderHistory();
        }
    },
    
    renderHistory: function() {
        const list = document.getElementById('search-history-list');
        list.innerHTML = '';
        
        if (this.history.length === 0) {
            document.getElementById('search-history').style.display = 'none';
            return;
        }
        
        document.getElementById('search-history').style.display = 'block';
        
        this.history.forEach((record, index) => {
            const li = document.createElement('li');
            li.style.padding = '8px';
            li.style.borderBottom = '1px solid #ddd';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            
            const querySpan = document.createElement('span');
            querySpan.textContent = `${index + 1}. ${record.query}`;
            querySpan.style.cursor = 'pointer';
            querySpan.style.flexGrow = '1';
            querySpan.addEventListener('click', () => {
                document.getElementById('search-input').value = record.query;
            });
            
            const timeSpan = document.createElement('span');
            timeSpan.textContent = record.time;
            timeSpan.style.color = '#777';
            timeSpan.style.fontSize = '0.8em';
            timeSpan.style.marginLeft = '10px';
            
            const deleteBtn = document.createElement('span');
            deleteBtn.innerHTML = '&times;';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.marginLeft = '10px';
            deleteBtn.style.color = '#f44336';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteRecord(index);
            });
            
            li.appendChild(querySpan);
            li.appendChild(timeSpan);
            li.appendChild(deleteBtn);
            list.appendChild(li);
        });
    },
    
    deleteRecord: function(index) {
        this.history.splice(index, 1);
        this.saveHistory();
        this.renderHistory();
    },
    
    clearHistory: function() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    },
    
    saveHistory: function() {
        localStorage.setItem('searchHistory', JSON.stringify(this.history));
    }
};



// 排行榜管理器
const LeaderboardManager = {
     // 新增方法：清空指定游戏的排行榜
    clearGameLeaderboard: function(gameName) {
        if (confirm(`确定要清空${this.getGameTitle(gameName)}的排行榜吗？此操作不可撤销！`)) {
            localStorage.setItem(`leaderboard_${gameName}`, JSON.stringify([]));
            this.showLeaderboard(gameName);
        }
    },
    
    // 新增方法：清空所有游戏的排行榜
    clearAllLeaderboards: function() {
        if (confirm('确定要清空所有游戏的排行榜吗？此操作不可撤销！')) {
            ['snake', 'tetris', 'sokoban', 'piano'].forEach(game => {
                localStorage.setItem(`leaderboard_${game}`, JSON.stringify([]));
            });
            this.showLeaderboard('all');
        }
    },
    
    // 辅助方法：获取游戏标题
    getGameTitle: function(gameName) {
        const gameTitles = {
            snake: '贪吃蛇',
            tetris: '俄罗斯方块',
            sokoban: '推箱子',
            piano: '钢琴块'
        };
        return gameTitles[gameName] || '';
    },
    // 初始化排行榜
    init: function() {
        // 设置按钮点击事件
        document.getElementById('leaderboard-btn').addEventListener('click', () => {
            this.showLeaderboard('all');
        });
        
        // 关闭按钮
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('leaderboard-modal').style.display = 'none';
        });
        
        // 点击模态框外部关闭
        window.addEventListener('click', (event) => {
            if (event.target === document.getElementById('leaderboard-modal')) {
                document.getElementById('leaderboard-modal').style.display = 'none';
            }
        });
        
        // 初始化各游戏排行榜数据
        this.initGameLeaderboard('snake');
        this.initGameLeaderboard('tetris');
        this.initGameLeaderboard('sokoban');
        this.initGameLeaderboard('piano');

         // 修改清空按钮事件
        document.getElementById('clear-leaderboard-btn').addEventListener('click', () => {
            const gameName = document.getElementById('leaderboard-title').textContent.replace('排行榜', '').trim();
            const gameKey = {
                '贪吃蛇': 'snake',
                '俄罗斯方块': 'tetris',
                '推箱子': 'sokoban',
                '钢琴块': 'piano',
                '所有游戏': 'all'
            }[gameName];
            
            if (gameKey === 'all') {
                this.clearAllLeaderboards();
            } else if (gameKey) {
                this.clearGameLeaderboard(gameKey);
            }
        });
        
        // 添加新的控制按钮
        this.addLeaderboardControls();
    },
    // 新增方法：添加排行榜控制按钮
    addLeaderboardControls: function() {
        const modalContent = document.querySelector('.modal-content');
        
        // 创建按钮容器
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '10px';
        btnContainer.style.marginBottom = '15px';
        btnContainer.style.justifyContent = 'center';
        
        // 添加"清空当前游戏"按钮
        const clearCurrentBtn = document.createElement('button');
        clearCurrentBtn.textContent = '清空当前游戏';
        clearCurrentBtn.className = 'leaderboard-control-btn';
        clearCurrentBtn.onclick = () => {
            const gameName = document.getElementById('leaderboard-title').textContent.replace('排行榜', '').trim();
            const gameKey = {
                '贪吃蛇': 'snake',
                '俄罗斯方块': 'tetris',
                '推箱子': 'sokoban',
                '钢琴块': 'piano'
            }[gameName];
            if (gameKey) this.clearGameLeaderboard(gameKey);
        };
        
        // 添加"清空所有游戏"按钮
        const clearAllBtn = document.createElement('button');
        clearAllBtn.textContent = '清空所有游戏';
        clearAllBtn.className = 'leaderboard-control-btn';
        clearAllBtn.onclick = () => this.clearAllLeaderboards();
        
        // 将按钮添加到容器
        btnContainer.appendChild(clearCurrentBtn);
        btnContainer.appendChild(clearAllBtn);
        
        // 将容器插入到模态框中
        modalContent.insertBefore(btnContainer, document.getElementById('leaderboard-list'));
    },
    
    // 初始化游戏排行榜数据
    initGameLeaderboard: function(gameName) {
        if (!localStorage.getItem(`leaderboard_${gameName}`)) {
            localStorage.setItem(`leaderboard_${gameName}`, JSON.stringify([]));
        }
    },
    
    // 添加分数到排行榜
    addScore: function(gameName, score, additionalData = {}) {
    const leaderboard = JSON.parse(localStorage.getItem(`leaderboard_${gameName}`));
    // 修改这里，使用 toLocaleString() 包含时间
    const datetime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).replace(/\//g, '-');
    
    leaderboard.push({
        score,
        datetime,  // 修改字段名从 date 到 datetime
        ...additionalData
    });
    
    // 按分数排序并保留前10名
    leaderboard.sort((a, b) => b.score - a.score);
    const top10 = leaderboard.slice(0, 10);
    
    localStorage.setItem(`leaderboard_${gameName}`, JSON.stringify(top10));
},
    
    // 显示排行榜
    showLeaderboard: function(gameName) {
        const modal = document.getElementById('leaderboard-modal');
        const title = document.getElementById('leaderboard-title');
        const list = document.getElementById('leaderboard-list');
        
        // 设置标题
        if (gameName === 'all') {
            title.textContent = '所有游戏排行榜';
        } else {
            const gameTitles = {
                snake: '贪吃蛇',
                tetris: '俄罗斯方块',
                sokoban: '推箱子',
                piano: '钢琴块'
            };
            title.textContent = `${gameTitles[gameName]}排行榜`;
        }
        
        // 清空列表
        list.innerHTML = '';
        
        if (gameName === 'all') {
            // 显示所有游戏排行榜
            ['snake', 'tetris', 'sokoban', 'piano'].forEach(game => {
                const gameTitle = {
                    snake: '贪吃蛇',
                    tetris: '俄罗斯方块',
                    sokoban: '推箱子',
                    piano: '钢琴块'
                }[game];
                
                const header = document.createElement('h3');
                header.textContent = gameTitle;
                list.appendChild(header);
                
                this.renderGameLeaderboard(game, list);
            });
        } else {
            // 显示单个游戏排行榜
            this.renderGameLeaderboard(gameName, list);
        }
        
        modal.style.display = 'block';
    },
    
    // 渲染单个游戏排行榜
   renderGameLeaderboard: function(gameName, container) {
    const leaderboard = JSON.parse(localStorage.getItem(`leaderboard_${gameName}`)) || [];
    
    if (leaderboard.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = '暂无记录';
        container.appendChild(emptyMsg);
        return;
    }
    
    leaderboard.forEach((entry, index) => {
        const entryElement = document.createElement('div');
        entryElement.className = 'leaderboard-entry';
        
        const rank = document.createElement('span');
        rank.textContent = `${index + 1}.`;
        
        const score = document.createElement('span');
        
        // 根据不同游戏显示不同分数格式
        switch(gameName) {
            case 'snake':
                score.textContent = `分数: ${entry.score} (长度: ${entry.length || 'N/A'})`;
                break;
            case 'tetris':
                score.textContent = `分数: ${entry.score} (等级: ${entry.level || 1})`;
                break;
            case 'sokoban':
                score.textContent = `关卡: ${entry.level + 1} (步数: ${entry.moves})`;
                break;
            case 'piano':
                score.textContent = `分数: ${entry.score}`;
                break;
            default:
                score.textContent = `分数: ${entry.score}`;
        }
        
        const datetime = document.createElement('span');
        datetime.textContent = entry.datetime || '未知时间';  // 修改这里使用 datetime
        datetime.style.color = '#777';
        datetime.style.fontSize = '0.8em';
        datetime.style.minWidth = '120px';
        datetime.style.textAlign = 'right';
        
        entryElement.appendChild(rank);
        entryElement.appendChild(score);
        entryElement.appendChild(datetime);
        
        container.appendChild(entryElement);
    });
}
};

// 初始化排行榜管理器
LeaderboardManager.init();

// 游戏管理器
const GameManager = {
    currentGame: null,
    canvas: null,
    ctx: null,
    
    init: function() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置游戏卡片点击事件
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => this.loadGame(card.dataset.game));
        });
        
        // 设置控制按钮
        document.getElementById('startBtn').addEventListener('click', () => {
            if (this.currentGame) this.currentGame.start();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            if (this.currentGame) this.currentGame.pause();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            if (this.currentGame) this.currentGame.restart();
        });
        
        document.getElementById('backBtn').addEventListener('click', () => {
            this.unloadGame();
        });
        // 移动端方向键控制
    document.getElementById('up-btn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.currentGame && this.currentGame.handleKeyPress) {
            this.currentGame.handleKeyPress({key: 'ArrowUp', preventDefault: () => {}});
        }
    });
    
    document.getElementById('left-btn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.currentGame && this.currentGame.handleKeyPress) {
            this.currentGame.handleKeyPress({key: 'ArrowLeft', preventDefault: () => {}});
        }
    });
    
    document.getElementById('right-btn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.currentGame && this.currentGame.handleKeyPress) {
            this.currentGame.handleKeyPress({key: 'ArrowRight', preventDefault: () => {}});
        }
    });
    
    document.getElementById('down-btn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.currentGame && this.currentGame.handleKeyPress) {
            this.currentGame.handleKeyPress({key: 'ArrowDown', preventDefault: () => {}});
        }
    });
    
    document.getElementById('rotate-btn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.currentGame && this.currentGame.handleKeyPress) {
            this.currentGame.handleKeyPress({key: 'ArrowUp', preventDefault: () => {}});
        }
    });
    
    document.getElementById('action-btn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.currentGame && this.currentGame.handleKeyPress) {
            this.currentGame.handleKeyPress({key: ' ', preventDefault: () => {}});
        }
    });
    
        // 初始隐藏游戏显示区域
        document.getElementById('game-display').style.display = 'none';
    },
    
    loadGame: function(gameName) {
        // 隐藏游戏选择界面
        document.getElementById('game-container').style.display = 'none';
        
        // 显示游戏界面
        const gameDisplay = document.getElementById('game-display');
        gameDisplay.style.display = 'block';
        
        // 根据选择加载游戏
        switch(gameName) {
            case 'snake':
                this.currentGame = new SnakeGame(this.canvas, this.ctx);
                break;
            case 'tetris':
                this.currentGame = new TetrisGame(this.canvas, this.ctx);
                break;
            case 'sokoban':
                this.currentGame = new SokobanGame(this.canvas, this.ctx);
                break;
            case 'piano':
                this.currentGame = new PianoGame(this.canvas, this.ctx);
                break;
        }
        
        // 初始化游戏
        if (this.currentGame) {
            this.currentGame.init();
            this.updateGameStats();
        }
    },
    
    unloadGame: function() {
        if (this.currentGame) {
            // 清理残留按钮
            const existingBtns = this.canvas.parentNode.querySelectorAll('button[onclick*="showLeaderboard"]');
            existingBtns.forEach(btn => btn.remove());
            
            // 清理游戏实例的按钮
            if (this.currentGame.cleanupLeaderboardButton) {
                this.currentGame.cleanupLeaderboardButton();
            }
            
            this.currentGame.stop();
            this.currentGame = null;
        }
        
        document.getElementById('game-container').style.display = 'flex';
        document.getElementById('game-display').style.display = 'none';
    },
    
    updateGameStats: function() {
        if (!this.currentGame) return;
        
        const statsElement = document.getElementById('gameStats');
        let statsText = '';
        
        if (this.currentGame instanceof SnakeGame) {
            statsText = `分数: ${this.currentGame.score} | 长度: ${this.currentGame.snake.length}`;
        } else if (this.currentGame instanceof TetrisGame) {
            statsText = `分数: ${this.currentGame.score} | 等级: ${this.currentGame.level}`;
        } else if (this.currentGame instanceof SokobanGame) {
            statsText = `关卡: ${this.currentGame.currentLevel + 1}/${this.currentGame.levels.length} | 移动步数: ${this.currentGame.moves}`;
        } else if (this.currentGame instanceof PianoGame) {
            statsText = `分数: ${this.currentGame.score}`;
        }
        
        statsElement.textContent = statsText;
    }
};

// 贪吃蛇游戏实现
class SnakeGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.leaderboardBtn = null;
        this.leaderboardBtnCreated = false;
        this.snake = [];
        this.food = {};
        this.direction = 'right';
        this.nextDirection = 'right';
        this.gameSpeed = 100;
        this.score = 0;
        this.gameLoop = null;
        this.isPaused = false;
        this.gameOver = false;
        this.leaderboardBtn = null;
    }
     cleanupLeaderboardButton() {
        if (this.leaderboardBtn) {
            this.leaderboardBtn.remove();
            this.leaderboardBtn = null;
        }
        this.leaderboardBtnCreated = false;
    }
     
    init() {
        // 设置画布大小
        this.canvas.width = 400;
        this.canvas.height = 400;
        
        // 初始化蛇
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        
        // 初始化食物
        this.spawnFood();
        
        // 初始化分数
        this.score = 0;
        this.gameOver = false;
        
        // 设置键盘控制
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // 绘制初始状态
        this.draw();
    }
    
    start() {
        if (this.gameOver) {
            this.restart();
            return;
        }
        
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.isPaused = false;
        this.gameLoop = setInterval(this.update.bind(this), this.gameSpeed);
    }
    
    pause() {
        if (this.isPaused) {
            this.start();
        } else {
            clearInterval(this.gameLoop);
            this.isPaused = true;
            this.draw();
        }
    }
    
    stop() {
        clearInterval(this.gameLoop);
        document.removeEventListener('keydown', this.handleKeyPress.bind(this));
    }
    
    restart() {
        // 移除排行榜按钮
        if (this.leaderboardBtn) {
            this.leaderboardBtn.remove();
            this.leaderboardBtn = null;
        }
        
        this.stop();
        this.init();
        this.start();
    }
    
    update() {
        this.direction = this.nextDirection;
        this.moveSnake();
        
        if (this.checkCollision()) {
            this.gameOver = true;
            this.drawGameOver();
            this.stop();
            return;
        }
        
        this.checkFood();
        this.draw();
        GameManager.updateGameStats();
    }
    
    moveSnake() {
        const head = {x: this.snake[0].x, y: this.snake[0].y};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        this.snake.unshift(head);
        this.snake.pop();
    }
    
    checkCollision() {
        const head = this.snake[0];
        
        // 边界检查
        if (head.x < 0 || head.x >= this.canvas.width/20 || 
            head.y < 0 || head.y >= this.canvas.height/20) {
            return true;
        }
        
        // 自身碰撞检查
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    checkFood() {
        if (this.snake[0].x === this.food.x && this.snake[0].y === this.food.y) {
            // 增加蛇长度
            const tail = this.snake[this.snake.length-1];
            this.snake.push({x: tail.x, y: tail.y});
            
            // 生成新食物
            this.spawnFood();
            
            // 增加分数
            this.score += 10;
            
            // 加速游戏
            if (this.score % 50 === 0 && this.gameSpeed > 50) {
                this.gameSpeed -= 5;
                this.start(); // 重新开始游戏循环以应用新速度
            }
        }
    }
    
    spawnFood() {
        this.food = {
            x: Math.floor(Math.random() * (this.canvas.width/20)),
            y: Math.floor(Math.random() * (this.canvas.height/20))
        };
        
        // 确保食物不会出现在蛇身上
        this.snake.forEach(segment => {
            if (segment.x === this.food.x && segment.y === this.food.y) {
                this.spawnFood();
            }
        });
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#4CAF50' : '#81C784';
            this.ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
        });
        
        // 绘制食物
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.food.x * 20, this.food.y * 20, 18, 18);
        
        // 绘制分数
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`分数: ${this.score}`, 10, 30);
        
        if (this.isPaused) {
            this.drawPauseScreen();
        }
    }
    
    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏暂停', this.canvas.width/2, this.canvas.height/2);
        this.ctx.textAlign = 'left';
    }
    
    drawGameOver() {
        // 保存分数到排行榜
        LeaderboardManager.addScore('snake', this.score, {
            length: this.snake.length
        });
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束!', this.canvas.width/2, this.canvas.height/2 - 30);
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`最终分数: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 10);
        this.ctx.fillText('按"重新开始"按钮继续', this.canvas.width/2, this.canvas.height/2 + 50);
        this.ctx.textAlign = 'left';

        this.cleanupLeaderboardButton();
        
        // 显示排行榜按钮
        const leaderboardBtn = document.createElement('button');
        leaderboardBtn.textContent = '查看排行榜';
        leaderboardBtn.style.position = 'absolute';
        leaderboardBtn.style.left = '50%';
        leaderboardBtn.style.transform = 'translateX(-50%)';
        leaderboardBtn.style.bottom = '100px';
        leaderboardBtn.onclick = () => LeaderboardManager.showLeaderboard('snake');
        
        // 添加到canvas容器
        this.canvas.parentNode.appendChild(leaderboardBtn);
        
        // 保存引用以便移除
        this.leaderboardBtn = leaderboardBtn;
    }
    
    handleKeyPress(e) {
        if (this.isPaused || this.gameOver) return;
        
        switch(e.key) {
            case 'ArrowUp': 
                if (this.direction !== 'down') this.nextDirection = 'up'; 
                break;
            case 'ArrowDown': 
                if (this.direction !== 'up') this.nextDirection = 'down'; 
                break;
            case 'ArrowLeft': 
                if (this.direction !== 'right') this.nextDirection = 'left'; 
                break;
            case 'ArrowRight': 
                if (this.direction !== 'left') this.nextDirection = 'right'; 
                break;
            case ' ':
                this.pause();
                break;
        }
    }
}

// 俄罗斯方块游戏实现
class TetrisGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.leaderboardBtn = null;
        this.leaderboardBtnCreated = false;
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.gameLoop = null;
        this.isPaused = false;
        this.gameOver = false;
        this.dropInterval = 1000;
        this.lastDrop = 0;
        this.leaderboardBtn = null;
        
        // 方块形状定义
        this.shapes = [
            [[1, 1, 1, 1]], // I
            [[1, 1], [1, 1]], // O
            [[1, 1, 1], [0, 1, 0]], // T
            [[1, 1, 1], [1, 0, 0]], // L
            [[1, 1, 1], [0, 0, 1]], // J
            [[0, 1, 1], [1, 1, 0]], // S
            [[1, 1, 0], [0, 1, 1]]  // Z
        ];
        
        // 方块颜色
        this.colors = [
            '#00FFFF', // I - 青色
            '#FFFF00', // O - 黄色
            '#AA00FF', // T - 紫色
            '#FF7F00', // L - 橙色
            '#0000FF', // J - 蓝色
            '#00FF00', // S - 绿色
            '#FF0000'  // Z - 红色
        ];
    }
    
    cleanupLeaderboardButton() {
        if (this.leaderboardBtn) {
            this.leaderboardBtn.remove();
            this.leaderboardBtn = null;
        }
        this.leaderboardBtnCreated = false;
    }

    init() {
        // 设置画布大小
        this.canvas.width = 300;
        this.canvas.height = 600;
        
        // 初始化游戏板
        this.resetBoard();
        
        // 创建第一个方块
        this.createNewPiece();
        
        // 初始化分数和等级
        this.score = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.gameOver = false;
        
        // 设置键盘控制
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // 绘制初始状态
        this.draw();
    }
    
    resetBoard() {
        this.board = Array(20).fill().map(() => Array(10).fill(0));
    }
    
    createNewPiece() {
        if (this.nextPiece) {
            this.currentPiece = this.nextPiece;
        } else {
            const shapeIndex = Math.floor(Math.random() * this.shapes.length);
            this.currentPiece = {
                shape: this.shapes[shapeIndex],
                color: this.colors[shapeIndex],
                x: Math.floor(10 / 2) - Math.floor(this.shapes[shapeIndex][0].length / 2),
                y: 0
            };
        }
        
        // 创建下一个方块
        const nextShapeIndex = Math.floor(Math.random() * this.shapes.length);
        this.nextPiece = {
            shape: this.shapes[nextShapeIndex],
            color: this.colors[nextShapeIndex],
            x: Math.floor(10 / 2) - Math.floor(this.shapes[nextShapeIndex][0].length / 2),
            y: 0
        };
        
        // 检查游戏是否结束
        if (this.checkCollision()) {
            this.gameOver = true;
            this.stop();
            this.drawGameOver();
        }
    }
    
    start() {
        if (this.gameOver) {
            this.restart();
            return;
        }
        
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.isPaused = false;
        this.lastDrop = Date.now();
        this.gameLoop = setInterval(this.update.bind(this), 16); // 约60fps
    }
    
    pause() {
        if (this.isPaused) {
            this.start();
        } else {
            clearInterval(this.gameLoop);
            this.isPaused = true;
            this.draw();
        }
    }
    
    stop() {
        clearInterval(this.gameLoop);
        document.removeEventListener('keydown', this.handleKeyPress.bind(this));
    }
    
    restart() {
        // 移除排行榜按钮
        if (this.leaderboardBtn) {
            this.leaderboardBtn.remove();
            this.leaderboardBtn = null;
        }
        
        this.stop();
        this.init();
        this.start();
    }
    
    update() {
        const now = Date.now();
        const delta = now - this.lastDrop;
        
        if (delta > this.dropInterval) {
            this.moveDown();
            this.lastDrop = now;
        }
        
        this.draw();
        GameManager.updateGameStats();
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制已落下的方块
        this.drawBoard();
        
        // 绘制当前方块
        this.drawPiece(this.currentPiece);
        
        // 绘制分数和等级
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`分数: ${this.score}`, 10, 30);
        this.ctx.fillText(`等级: ${this.level}`, 10, 60);
        
        // 绘制下一个方块预览
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('下一个:', 200, 30);
        this.drawNextPiece();
        
        if (this.isPaused) {
            this.drawPauseScreen();
        }
        
        if (this.gameOver) {
            this.drawGameOver();
        }
    }
    
    drawBoard() {
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                if (this.board[y][x]) {
                    this.ctx.fillStyle = this.colors[this.board[y][x] - 1];
                    this.ctx.fillRect(x * 30, y * 30, 29, 29);
                }
            }
        }
    }
    
    drawPiece(piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    this.ctx.fillStyle = piece.color;
                    this.ctx.fillRect(
                        (piece.x + x) * 30,
                        (piece.y + y) * 30,
                        29, 29
                    );
                }
            }
        }
    }
    
    drawNextPiece() {
        const previewSize = this.nextPiece.shape[0].length * 30;
        const startX = 200 + (4 * 30 - previewSize) / 2;
        
        for (let y = 0; y < this.nextPiece.shape.length; y++) {
            for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                if (this.nextPiece.shape[y][x]) {
                    this.ctx.fillStyle = this.nextPiece.color;
                    this.ctx.fillRect(
                        startX + x * 30,
                        50 + y * 30,
                        29, 29
                    );
                }
            }
        }
    }
    
    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏暂停', this.canvas.width/2, this.canvas.height/2);
        this.ctx.textAlign = 'left';
    }
    
    drawGameOver() {
        // 保存分数到排行榜
        LeaderboardManager.addScore('tetris', this.score, {
            level: this.level
        });
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束!', this.canvas.width/2, this.canvas.height/2 - 30);
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`最终分数: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 10);
        this.ctx.fillText('按"重新开始"按钮继续', this.canvas.width/2, this.canvas.height/2 + 50);
        this.ctx.textAlign = 'left';
        this.cleanupLeaderboardButton();
        // 显示排行榜按钮
        const leaderboardBtn = document.createElement('button');
        leaderboardBtn.textContent = '查看排行榜';
        leaderboardBtn.style.position = 'absolute';
        leaderboardBtn.style.left = '50%';
        leaderboardBtn.style.transform = 'translateX(-50%)';
        leaderboardBtn.style.bottom = '100px';
        leaderboardBtn.onclick = () => LeaderboardManager.showLeaderboard('tetris');
        
        // 添加到canvas容器
        this.canvas.parentNode.appendChild(leaderboardBtn);
        
        // 保存引用以便移除
        this.leaderboardBtn = leaderboardBtn;
    }
    
    moveDown() {
        this.currentPiece.y++;
        
        if (this.checkCollision()) {
            this.currentPiece.y--;
            this.lockPiece();
            this.clearLines();
            this.createNewPiece();
        }
    }
    
    moveLeft() {
        this.currentPiece.x--;
        
        if (this.checkCollision()) {
            this.currentPiece.x++;
        }
    }
    
    moveRight() {
        this.currentPiece.x++;
        
        if (this.checkCollision()) {
            this.currentPiece.x--;
        }
    }
    
    rotate() {
        const originalShape = this.currentPiece.shape;
        const rows = originalShape.length;
        const cols = originalShape[0].length;
        
        // 创建新的旋转后的形状
        const newShape = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                newShape[x][rows - 1 - y] = originalShape[y][x];
            }
        }
        
        const originalX = this.currentPiece.x;
        const originalY = this.currentPiece.y;
        const originalShapeRef = this.currentPiece.shape;
        
        this.currentPiece.shape = newShape;
        
        // 调整位置防止旋转后超出边界
        if (this.currentPiece.x + newShape[0].length > 10) {
            this.currentPiece.x = 10 - newShape[0].length;
        }
        
        if (this.currentPiece.x < 0) {
            this.currentPiece.x = 0;
        }
        
        if (this.checkCollision()) {
            // 如果旋转后发生碰撞，尝试左右移动
            let offset = 1;
            while (offset <= 2) {
                // 尝试向右移动
                this.currentPiece.x = originalX + offset;
                if (!this.checkCollision()) return;
                
                // 尝试向左移动
                this.currentPiece.x = originalX - offset;
                if (!this.checkCollision()) return;
                
                offset++;
            }
            
            // 如果所有尝试都失败，恢复原始状态
            this.currentPiece.x = originalX;
            this.currentPiece.y = originalY;
            this.currentPiece.shape = originalShapeRef;
        }
    }
    
    checkCollision() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x] !== 0) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (
                        boardX < 0 ||
                        boardX >= 10 ||
                        boardY >= 20 ||
                        (boardY >= 0 && this.board[boardY][boardX])
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    lockPiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    if (boardY >= 0) { // 确保不会在游戏区域上方锁定方块
                        const boardX = this.currentPiece.x + x;
                        // 将形状索引+1存储，0表示空
                        this.board[boardY][boardX] = this.colors.indexOf(this.currentPiece.color) + 1;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = 19; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                // 移除该行
                this.board.splice(y, 1);
                // 在顶部添加新行
                this.board.unshift(Array(10).fill(0));
                linesCleared++;
                y++; // 再次检查当前行，因为上面的行已经下移
            }
        }
        
        if (linesCleared > 0) {
            // 更新分数
            const points = [0, 100, 300, 500, 800][linesCleared] * this.level;
            this.score += points;
            
            // 每清除10行升一级
            const newLevel = Math.floor(this.score / 1000) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            }
        }
    }
    
    handleKeyPress(e) {
        if (this.isPaused || this.gameOver) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                this.moveLeft();
                break;
            case 'ArrowRight':
                this.moveRight();
                break;
            case 'ArrowDown':
                this.moveDown();
                break;
            case 'ArrowUp':
                this.rotate();
                break;
            case ' ':
                this.hardDrop();
                break;
            case 'p':
            case 'P':
                this.pause();
                break;
        }
    }
    
    hardDrop() {
        while (!this.checkCollision()) {
            this.currentPiece.y++;
        }
        this.currentPiece.y--;
        this.lockPiece();
        this.clearLines();
        this.createNewPiece();
    }
}

// 推箱子游戏实现
class SokobanGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.leaderboardBtn = null;
        this.leaderboardBtnCreated = false;
        this.levels = [
            // 关卡1
            [
                "########",
                "#     .#",
                "# oo   #",
                "#     p#",
                "########"
            ],
            // 关卡2
            [
                "#######",
                "#.   .#",
                "# o o #",
                "#  p  #",
                "#######"
            ],
            // 关卡3
            [
                "########",
                "#.    .#",
                "# oo o #",
                "#   p  #",
                "########"
            ]
        ];
        this.currentLevel = 0;
        this.map = [];
        this.player = {x: 0, y: 0};
        this.boxes = [];
        this.targets = [];
        this.moves = 0;
        this.gameLoop = null;
        this.isPaused = false;
        this.gameOver = false;
        this.cellSize = 40;
        this.lastMoveTime = 0;
        this.moveDelay = 200;
        this.leaderboardBtn = null;
    }
     cleanupLeaderboardButton() {
        // 移除按钮元素
        if (this.leaderboardBtn && this.leaderboardBtn.parentNode) {
            this.leaderboardBtn.remove();
        }
        this.leaderboardBtn = null;
        this.leaderboardBtnCreated = false;
        
        // 额外安全措施：移除任何可能残留的按钮
        const existingBtns = this.canvas.parentNode.querySelectorAll('button[onclick*="showLeaderboard"]');
        existingBtns.forEach(btn => btn.remove());
    }
    init() {
        // 设置画布大小
        this.canvas.width = this.levels[this.currentLevel][0].length * this.cellSize;
        this.canvas.height = this.levels[this.currentLevel].length * this.cellSize;
        
        // 加载当前关卡
        this.loadLevel(this.currentLevel);
        
        // 初始化移动步数
        this.moves = 0;
        this.gameOver = false;
        this.lastMoveTime = 0;
        
        // 设置键盘控制
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), {passive: false});
        
        // 绘制初始状态
        this.draw();
    }
    
    loadLevel(levelIndex) {
        this.map = [];
        this.boxes = [];
        this.targets = [];
        
        const level = this.levels[levelIndex];
        
        for (let y = 0; y < level.length; y++) {
            const row = [];
            for (let x = 0; x < level[y].length; x++) {
                const cell = level[y][x];
                row.push(cell);
                
                switch(cell) {
                    case 'p':
                        this.player = {x, y};
                        row[x] = ' ';
                        break;
                    case 'o':
                        this.boxes.push({x, y});
                        row[x] = ' ';
                        break;
                    case '.':
                        this.targets.push({x, y});
                        row[x] = ' ';
                        break;
                    case '*':
                        this.boxes.push({x, y});
                        this.targets.push({x, y});
                        row[x] = ' ';
                        break;
                }
            }
            this.map.push(row);
        }
    }
    
    start() {
        if (this.gameOver) {
            this.restart();
            return;
        }
        
        this.isPaused = false;
        this.draw();
    }
    
    pause() {
        this.isPaused = !this.isPaused;
        this.draw();
    }
    
    stop() {
        this.cleanupLeaderboardButton();
        document.removeEventListener('keydown', this.handleKeyPress.bind(this));
        this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    }
    
    restart() {
        this.cleanupLeaderboardButton();
        // 移除排行榜按钮
        if (this.leaderboardBtn) {
            this.leaderboardBtn.remove();
            this.leaderboardBtn = null;
        }
        
        this.stop();
        this.currentLevel = 0;
        this.init();
        this.start();
    }
    
    nextLevel() {
        // 如果是最后一关完成，保存分数
        this.cleanupLeaderboardButton();
        if (this.currentLevel >= this.levels.length - 1) {
            LeaderboardManager.addScore('sokoban', this.currentLevel + 1, {
                moves: this.moves,
                level: this.currentLevel
            });
        }
        
        this.currentLevel++;
        if (this.currentLevel >= this.levels.length) {
            this.gameOver = true;
            this.drawGameComplete();
        } else {
            this.init();
            this.start();
        }
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制地图
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                const cell = this.map[y][x];
                
                // 绘制墙壁
                if (cell === '#') {
                    this.ctx.fillStyle = '#555';
                    this.ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                    
                    this.ctx.strokeStyle = '#777';
                    this.ctx.strokeRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
                // 绘制空地
                else {
                    this.ctx.fillStyle = '#222';
                    this.ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                    
                    this.ctx.strokeStyle = '#444';
                    this.ctx.strokeRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }
        
        // 绘制目标点
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        this.targets.forEach(target => {
            this.ctx.beginPath();
            this.ctx.arc(
                (target.x + 0.5) * this.cellSize,
                (target.y + 0.5) * this.cellSize,
                this.cellSize / 3,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
        
        // 绘制箱子
        this.boxes.forEach(box => {
            const isOnTarget = this.targets.some(
                target => target.x === box.x && target.y === box.y
            );
            
            this.ctx.fillStyle = isOnTarget ? '#FF9800' : '#8BC34A';
            this.ctx.fillRect(
                box.x * this.cellSize + 5,
                box.y * this.cellSize + 5,
                this.cellSize - 10,
                this.cellSize - 10
            );
            
            this.ctx.strokeStyle = '#5D4037';
            this.ctx.strokeRect(
                box.x * this.cellSize + 5,
                box.y * this.cellSize + 5,
                this.cellSize - 10,
                this.cellSize - 10
            );
        });
        
        // 绘制玩家
        this.ctx.fillStyle = '#2196F3';
        this.ctx.beginPath();
        this.ctx.arc(
            (this.player.x + 0.5) * this.cellSize,
            (this.player.y + 0.5) * this.cellSize,
            this.cellSize / 2 - 5,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // 绘制暂停画面
        if (this.isPaused) {
            this.drawPauseScreen();
        }
        
        // 更新游戏统计信息
        GameManager.updateGameStats();
    }
    
    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏暂停', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.textAlign = 'left';
    }
    
    drawGameComplete() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('恭喜通关!', this.canvas.width/2, this.canvas.height/2 - 30);
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`总移动步数: ${this.moves}`, this.canvas.width/2, this.canvas.height/2 + 10);
        this.ctx.fillText('按"重新开始"按钮继续', this.canvas.width/2, this.canvas.height/2 + 50);
        this.ctx.textAlign = 'left';
        this.cleanupLeaderboardButton();
        // 显示排行榜按钮
        const leaderboardBtn = document.createElement('button');
        leaderboardBtn.textContent = '查看排行榜';
        leaderboardBtn.style.position = 'absolute';
        leaderboardBtn.style.left = '50%';
        leaderboardBtn.style.transform = 'translateX(-50%)';
        leaderboardBtn.style.bottom = '100px';
        leaderboardBtn.onclick = () => LeaderboardManager.showLeaderboard('sokoban');
        
        // 添加到canvas容器
        this.canvas.parentNode.appendChild(leaderboardBtn);
        
        // 保存引用以便移除
        this.leaderboardBtn = leaderboardBtn;
    }
    
    checkWin() {
        return this.targets.every(target => 
            this.boxes.some(box => box.x === target.x && box.y === target.y)
        );
    }
    
    movePlayer(dx, dy) {
        const now = Date.now();
        if (now - this.lastMoveTime < this.moveDelay) {
            return;
        }
        this.lastMoveTime = now;

        if (this.isPaused || this.gameOver) return;
        
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        // 检查边界和墙壁
        if (
            newX < 0 || newX >= this.map[0].length ||
            newY < 0 || newY >= this.map.length ||
            this.map[newY][newX] === '#'
        ) {
            return;
        }
        
        // 检查是否有箱子
        const boxIndex = this.boxes.findIndex(b => b.x === newX && b.y === newY);
        if (boxIndex !== -1) {
            const newBoxX = newX + dx;
            const newBoxY = newY + dy;
            
            // 检查箱子能否移动
            if (
                newBoxX < 0 || newBoxX >= this.map[0].length ||
                newBoxY < 0 || newBoxY >= this.map.length ||
                this.map[newBoxY][newBoxX] === '#' ||
                this.boxes.some(b => b.x === newBoxX && b.y === newBoxY)
            ) {
                return;
            }
            
            // 移动箱子
            this.boxes[boxIndex].x = newBoxX;
            this.boxes[boxIndex].y = newBoxY;
        }
        
        // 移动玩家
        this.player.x = newX;
        this.player.y = newY;
        this.moves++;
        
        // 检查是否胜利
        if (this.checkWin()) {
            setTimeout(() => {
                this.nextLevel();
            }, 500);
        }
        
        this.draw();
    }
    
    handleKeyPress(e) {
        e.preventDefault();

        switch(e.key) {
            case 'ArrowUp':
                this.movePlayer(0, -1);
                break;
            case 'ArrowDown':
                this.movePlayer(0, 1);
                break;
            case 'ArrowLeft':
                this.movePlayer(-1, 0);
                break;
            case 'ArrowRight':
                this.movePlayer(1, 0);
                break;
            case 'r':
            case 'R':
                this.restart();
                break;
            case 'p':
            case 'P':
                this.pause();
                break;
        }
    }
    
    handleMouseDown(e) {
        if (this.isPaused || this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const keyIndex = Math.floor(x / this.keyWidth);
        
        if (keyIndex >= 0 && keyIndex < 5) {
            this.keyPressed[keyIndex] = true;
        }
    }
    
    handleTouchStart(e) {
        if (this.isPaused || this.gameOver) return;
        
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const keyIndex = Math.floor(x / this.keyWidth);
        
        if (keyIndex >= 0 && keyIndex < 5) {
            this.keyPressed[keyIndex] = true;
        }
    }
}

// 钢琴块游戏实现
class PianoGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.leaderboardBtn = null;
        this.leaderboardBtnCreated = false;
        this.keys = [];
        this.speed = 2;
        this.score = 0;
        this.gameLoop = null;
        this.isPaused = false;
        this.gameOver = false;
        this.keyWidth = 0;
        this.keyHeight = 0;
        this.fallingBlocks = [];
        this.blockSpeed = 2;
        this.spawnRate = 60; // 每60帧生成一个新块
        this.frameCount = 0;
        this.keyColors = ['#000000', '#FFFFFF', '#000000', '#FFFFFF', '#000000'];
        this.keyPressed = [false, false, false, false, false];
        this.leaderboardBtn = null;
    }
    cleanupLeaderboardButton() {
        if (this.leaderboardBtn) {
            this.leaderboardBtn.remove();
            this.leaderboardBtn = null;
        }
        this.leaderboardBtnCreated = false;
    }
    init() {
        // 设置画布大小
        this.canvas.width = 400;
        this.canvas.height = 600;
        
        // 计算键的尺寸
        this.keyWidth = this.canvas.width / 5;
        this.keyHeight = this.canvas.height / 6;
        
        // 初始化游戏状态
        this.score = 0;
        this.gameOver = false;
        this.fallingBlocks = [];
        this.frameCount = 0;
        
        // 设置键盘/触摸控制
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), {passive: false});
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // 绘制初始状态
        this.draw();
    }
    
    start() {
        if (this.gameOver) {
            this.restart();
            return;
        }
        
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.isPaused = false;
        this.gameLoop = setInterval(this.update.bind(this), 16); // 约60fps
    }
    
    pause() {
        if (this.isPaused) {
            this.start();
        } else {
            clearInterval(this.gameLoop);
            this.isPaused = true;
            this.draw();
        }
    }
    
    stop() {
        clearInterval(this.gameLoop);
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        document.removeEventListener('keyup', this.handleKeyUp.bind(this));
        this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    
    restart() {
        // 移除排行榜按钮
        if (this.leaderboardBtn) {
            this.leaderboardBtn.remove();
            this.leaderboardBtn = null;
        }
        
        this.stop();
        this.init();
        this.start();
    }
    
    update() {
        this.frameCount++;
        
        // 生成新块
        if (this.frameCount % this.spawnRate === 0) {
            this.spawnBlock();
            
            // 随着分数增加，提高难度
            if (this.score > 0 && this.score % 20 === 0) {
                this.spawnRate = Math.max(20, this.spawnRate - 5);
                this.blockSpeed = Math.min(6, this.blockSpeed + 0.2);
            }
        }
        
        // 移动所有下落块
        for (let i = this.fallingBlocks.length - 1; i >= 0; i--) {
            this.fallingBlocks[i].y += this.blockSpeed;
            
            // 检查是否超出底部
            if (this.fallingBlocks[i].y > this.canvas.height) {
                // 如果是黑块且未被击中，游戏结束
                if (this.fallingBlocks[i].color === '#000000') {
                    this.gameOver = true;
                    this.stop();
                    this.drawGameOver();
                    return;
                }
                this.fallingBlocks.splice(i, 1);
            }
        }
        
        // 检查碰撞
        this.checkCollisions();
        
        this.draw();
        GameManager.updateGameStats();
    }
    
    spawnBlock() {
        const keyIndex = Math.floor(Math.random() * 5);
        const isBlack = Math.random() > 0.3; // 70%黑块，30%白块
        
        this.fallingBlocks.push({
            x: keyIndex * this.keyWidth,
            y: -50,
            width: this.keyWidth,
            height: 50,
            color: isBlack ? '#000000' : '#FFFFFF',
            keyIndex: keyIndex,
            hit: false
        });
    }
    
    checkCollisions() {
        const hitAreaTop = this.canvas.height - this.keyHeight;
        
        for (let i = this.fallingBlocks.length - 1; i >= 0; i--) {
            const block = this.fallingBlocks[i];
            
            // 检查块是否进入击打区域
            if (block.y + block.height > hitAreaTop && block.y < hitAreaTop + this.keyHeight) {
                // 检查对应的键是否被按下
                if (this.keyPressed[block.keyIndex]) {
                    // 如果是白块被击中，游戏结束
                    if (block.color === '#FFFFFF') {
                        this.gameOver = true;
                        this.stop();
                        this.drawGameOver();
                        return;
                    }
                    
                    // 如果是黑块且未被击中过
                    if (!block.hit && block.color === '#000000') {
                        block.hit = true;
                        this.score++;
                        // 添加击中效果
                        block.color = '#4CAF50'; // 击中后变绿色
                    }
                }
            }
            
            // 如果黑块离开击打区域且未被击中，游戏结束
            if (block.y > hitAreaTop + this.keyHeight && block.color === '#000000' && !block.hit) {
                this.gameOver = true;
                this.stop();
                this.drawGameOver();
                return;
            }
        }
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制钢琴键
        for (let i = 0; i < 5; i++) {
            this.ctx.fillStyle = this.keyColors[i];
            this.ctx.fillRect(
                i * this.keyWidth,
                this.canvas.height - this.keyHeight,
                this.keyWidth,
                this.keyHeight
            );
            
            // 绘制键被按下的效果
            if (this.keyPressed[i]) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                this.ctx.fillRect(
                    i * this.keyWidth,
                    this.canvas.height - this.keyHeight,
                    this.keyWidth,
                    this.keyHeight
                );
            }
            
            // 绘制键的分隔线
            this.ctx.strokeStyle = '#999';
            this.ctx.strokeRect(
                i * this.keyWidth,
                this.canvas.height - this.keyHeight,
                this.keyWidth,
                this.keyHeight
            );
        }
        
        // 绘制下落块
        this.fallingBlocks.forEach(block => {
            this.ctx.fillStyle = block.color;
            this.ctx.fillRect(block.x, block.y, block.width, block.height);
            
            // 绘制块的边框
            this.ctx.strokeStyle = '#999';
            this.ctx.strokeRect(block.x, block.y, block.width, block.height);
        });
        
        // 绘制分数
        this.ctx.fillStyle = '#333';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`分数: ${this.score}`, this.canvas.width / 2, 50);
        this.ctx.textAlign = 'left';
        
        // 绘制暂停画面
        if (this.isPaused) {
            this.drawPauseScreen();
        }
    }
    
    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏暂停', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.textAlign = 'left';
    }
    
    drawGameOver() {
        // 保存分数到排行榜
        LeaderboardManager.addScore('piano', this.score);
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束!', this.canvas.width/2, this.canvas.height/2 - 30);
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`最终分数: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 10);
        this.ctx.fillText('按"重新开始"按钮继续', this.canvas.width/2, this.canvas.height/2 + 50);
        this.ctx.textAlign = 'left';
        this.cleanupLeaderboardButton();
        // 显示排行榜按钮
        const leaderboardBtn = document.createElement('button');
        leaderboardBtn.textContent = '查看排行榜';
        leaderboardBtn.style.position = 'absolute';
        leaderboardBtn.style.left = '50%';
        leaderboardBtn.style.transform = 'translateX(-50%)';
        leaderboardBtn.style.bottom = '100px';
        leaderboardBtn.onclick = () => LeaderboardManager.showLeaderboard('piano');
        
        // 添加到canvas容器
        this.canvas.parentNode.appendChild(leaderboardBtn);
        
        // 保存引用以便移除
        this.leaderboardBtn = leaderboardBtn;
    }
    
    handleKeyDown(e) {
        if (this.isPaused || this.gameOver) return;
        
        // 数字键1-5控制五个键
        if (e.key >= '1' && e.key <= '5') {
            const keyIndex = parseInt(e.key) - 1;
            this.keyPressed[keyIndex] = true;
            e.preventDefault();
        }
        
        // 空格键暂停
        if (e.key === ' ') {
            this.pause();
            e.preventDefault();
        }
    }
    
    handleKeyUp(e) {
        if (e.key >= '1' && e.key <= '5') {
            const keyIndex = parseInt(e.key) - 1;
            this.keyPressed[keyIndex] = false;
            e.preventDefault();
        }
    }
    
    handleMouseDown(e) {
        if (this.isPaused || this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const keyIndex = Math.floor(x / this.keyWidth);
        
        if (keyIndex >= 0 && keyIndex < 5) {
            this.keyPressed[keyIndex] = true;
        }
    }
    
    handleTouchStart(e) {
        if (this.isPaused || this.gameOver) return;
        
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const keyIndex = Math.floor(x / this.keyWidth);
        
        if (keyIndex >= 0 && keyIndex < 5) {
            this.keyPressed[keyIndex] = true;
        }
    }
    
    handleMouseUp(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const keyIndex = Math.floor(x / this.keyWidth);
        
        if (keyIndex >= 0 && keyIndex < 5) {
            this.keyPressed[keyIndex] = false;
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        for (let i = 0; i < 5; i++) {
            this.keyPressed[i] = false;
        }
    }
}

// 初始化游戏管理器
window.onload = function() {
    GameManager.init();
};

// 更新时间和日期
function updateTime() {
    const now = new Date();
    
    // 格式化时间
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
    };
    document.getElementById('current-time').textContent = now.toLocaleTimeString('zh-CN', timeOptions);
    
    // 格式化日期
    const dateOptions = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        weekday: 'long'
    };
    document.getElementById('current-date').textContent = now.toLocaleDateString('zh-CN', dateOptions);
}

// 使用和风天气API获取天气数据
async function updateWeather() {
    // 请替换为你的和风天气API Key
    const API_KEY = 'b8acc9fbb5de468ea9d2513bc0fe4654';
    // 默认城市ID，可以替换为用户所在城市或根据IP自动获取
    const LOCATION_ID = 'CN101010100'; // 北京
    
    try {
        const response = await fetch(`https://devapi.qweather.com/v7/weather/now?location=${LOCATION_ID}&key=${API_KEY}`);
        const data = await response.json();
        
        if (data.code === '200') {
            const weatherInfo = data.now;
            
            document.getElementById('weather-info').textContent = 
                `${weatherInfo.text} ${weatherInfo.temp}°C`;
            document.getElementById('humidity-info').textContent = 
                `湿度: ${weatherInfo.humidity}%`;
            document.getElementById('body-temp-info').textContent = 
                `体感: ${weatherInfo.feelsLike}°C`;
            
            // 更新天气图标
            const weatherIcon = document.getElementById('weather-icon');
            if (weatherIcon) {
                weatherIcon.src = `https://a.hecdn.net/img/plugin/190516/icon/c/${weatherInfo.icon}.png`;
                weatherIcon.alt = weatherInfo.text;
            }
        } else {
            console.error('天气API错误:', data);
            showDefaultWeather();
        }
    } catch (error) {
        console.error('获取天气数据失败:', error);
        showDefaultWeather();
    }
}

// 默认天气显示
function showDefaultWeather() {
    document.getElementById('weather-info').textContent = '晴天 25°C';
    document.getElementById('humidity-info').textContent = '湿度: 60%';
    document.getElementById('body-temp-info').textContent = '体感: 26°C';
}

// 初始化时间和天气
updateTime();
updateWeather();

// 每秒更新时间
setInterval(updateTime, 1000);

// 每30分钟更新天气
setInterval(updateWeather, 1800000);


// 网页标签功能
const QuickLinks = {
    init: function() {
        this.links = JSON.parse(localStorage.getItem('quickLinks')) || [
            { name: '百度', url: 'https://www.baidu.com' },
            { name: 'Google', url: 'https://www.google.com' },
            { name: 'GitHub', url: 'https://github.com' }
        ];
        
        this.renderLinks();
        
        // 设置按钮事件
        document.getElementById('quick-links-btn').addEventListener('click', () => {
            const panel = document.getElementById('quick-links-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
        
        document.getElementById('add-quick-link').addEventListener('click', () => {
            document.getElementById('add-link-form').style.display = 'block';
        });
        
        document.getElementById('cancel-add-link').addEventListener('click', () => {
            document.getElementById('add-link-form').style.display = 'none';
            document.getElementById('link-name').value = '';
            document.getElementById('link-url').value = '';
        });
        
        document.getElementById('save-link').addEventListener('click', () => {
            const name = document.getElementById('link-name').value.trim();
            let url = document.getElementById('link-url').value.trim();
            
            if (name && url) {
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                
                this.links.push({ name, url });
                this.saveLinks();
                this.renderLinks();
                
                document.getElementById('add-link-form').style.display = 'none';
                document.getElementById('link-name').value = '';
                document.getElementById('link-url').value = '';
            }
        });
        
        // 点击外部关闭面板
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('quick-links-panel');
            const btn = document.getElementById('quick-links-btn');
            
            if (panel.style.display === 'block' && 
                !panel.contains(e.target) && 
                !btn.contains(e.target)) {
                panel.style.display = 'none';
            }
        });
    },
    
    renderLinks: function() {
        const list = document.getElementById('quick-links-list');
        list.innerHTML = '';
        
        if (this.links.length === 0) {
            list.innerHTML = '<p style="color: #777; text-align: center;">暂无标签</p>';
            return;
        }
        
        this.links.forEach((link, index) => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';
            item.style.padding = '8px';
            item.style.borderBottom = '1px solid #f0f0f0';
            
            const linkEl = document.createElement('a');
            linkEl.href = link.url;
            linkEl.target = '_blank';
            linkEl.textContent = link.name;
            linkEl.style.color = 'var(--primary-color)';
            linkEl.style.textDecoration = 'none';
            linkEl.style.flexGrow = '1';
            
            const deleteBtn = document.createElement('span');
            deleteBtn.innerHTML = '&times;';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.color = 'var(--danger-color)';
            deleteBtn.style.marginLeft = '10px';
            deleteBtn.style.fontSize = '18px';
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.links.splice(index, 1);
                this.saveLinks();
                this.renderLinks();
            });
            
            item.appendChild(linkEl);
            item.appendChild(deleteBtn);
            list.appendChild(item);
        });
    },
    
    saveLinks: function() {
        localStorage.setItem('quickLinks', JSON.stringify(this.links));
    }
};

// 初始化网页标签功能
document.addEventListener('DOMContentLoaded', function() {
    QuickLinks.init();
});
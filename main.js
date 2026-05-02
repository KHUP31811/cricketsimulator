// Global variables
let currentMatchType = 't20';
let team1Data = null;
let team2Data = null;
let matchResults = null;
let tossWinner = null;
let tossDecision = null;

// Team data with 20-man squads

// Validate squads at app start and show UI warnings for undersized squads or lineup constraint violations.
function validateSquads(options = {}) {
    const {
        minPlayers = 11,
        recommendedPlayers = 18,
        minBowlers = 4,
        requireWK = true,
        teamsObj = (typeof teams !== 'undefined') ? teams : null
    } = options;

    if (!teamsObj) {
        console.warn('validateSquads: no teams object found to validate.');
        return [];
    }

    const warnings = [];

    for (const [key, team] of Object.entries(teamsObj)) {
        const roster = Array.isArray(team.players) ? team.players : [];
        const rosterLen = roster.length;
        if (rosterLen < minPlayers) {
            warnings.push(`${team.name || key} has only ${rosterLen} players (minimum ${minPlayers}).`);
        } else if (rosterLen < recommendedPlayers) {
            warnings.push(`${team.name || key} has ${rosterLen} players (recommended ${recommendedPlayers}).`);
        }

        // lineup checks
        let bowlers = 0;
        let keepers = 0;
        let batsmen = 0;
        for (const p of roster) {
            const role = (p.role || '').toLowerCase();
            if (role.includes('bowler')) bowlers++;
            if (role.includes('wicket') || role.includes('keeper')) keepers++;
            if (role.includes('batsman')) batsmen++;
            if (role.includes('allrounder')) {
                // counts for both in a loose sense
                bowlers++;
                batsmen++;
            }
        }

        if (bowlers < minBowlers) {
            warnings.push(`${team.name || key} has only ${bowlers} primary bowlers (recommended ${minBowlers}).`);
        }
        if (requireWK && keepers < 1) {
            warnings.push(`${team.name || key} has no designated wicketkeeper.`);
        }
        if (batsmen < 5) {
            warnings.push(`${team.name || key} has only ${batsmen} players listed primarily as batsmen.`);
        }
    }

    // Render warnings in UI
    const container = document.querySelector('.container') || document.body;
    let warnEl = document.getElementById('squad-warnings');
    if (!warnEl) {
        warnEl = document.createElement('div');
        warnEl.id = 'squad-warnings';
        warnEl.style.background = '#fff4e5';
        warnEl.style.border = '1px solid #ffd29b';
        warnEl.style.padding = '12px 18px';
        warnEl.style.margin = '12px 0';
        warnEl.style.borderRadius = '10px';
        warnEl.style.color = '#6b4226';
        warnEl.style.fontWeight = '600';
        warnEl.style.position = 'relative';
        container.insertBefore(warnEl, container.firstChild);
    }

    // populate
    if (warnings.length === 0) {
        warnEl.style.display = 'none';
        console.info('validateSquads: all squads look good.');
    } else {
        warnEl.style.display = 'block';
        warnEl.innerHTML = '';
        const title = document.createElement('div');
        title.textContent = 'Squad validation warnings:';
        title.style.marginBottom = '8px';
        warnEl.appendChild(title);
        const ul = document.createElement('ul');
        ul.style.margin = '0';
        ul.style.paddingLeft = '18px';
        ul.style.fontWeight = '500';
        for (const w of warnings) {
            const li = document.createElement('li');
            li.textContent = w;
            ul.appendChild(li);
            console.warn('Squad validation:', w);
        }
        warnEl.appendChild(ul);

        // dismiss button
        const btn = document.createElement('button');
        btn.textContent = 'Dismiss';
        btn.style.position = 'absolute';
        btn.style.top = '8px';
        btn.style.right = '8px';
        btn.style.background = '#e25822';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.padding = '6px 10px';
        btn.style.borderRadius = '6px';
        btn.style.cursor = 'pointer';
        btn.onclick = () => { warnEl.style.display = 'none'; };
        warnEl.appendChild(btn);
    }

    return warnings;
}

// Normalize player ratings across all teams - take the highest rating for each player
function normalizePlayerRatings() {
    // First pass: collect all players and their ratings
    const playerRatings = {};

    Object.keys(teams).forEach(teamKey => {
        const team = teams[teamKey];
        team.players.forEach(player => {
            if (!playerRatings[player.name]) {
                playerRatings[player.name] = {
                    batting: player.batting,
                    bowling: player.bowling,
                    role: player.role
                };
            } else {
                // Update with highest ratings
                playerRatings[player.name].batting = Math.max(playerRatings[player.name].batting, player.batting);
                playerRatings[player.name].bowling = Math.max(playerRatings[player.name].bowling, player.bowling);
            }
        });
    });

    // Second pass: apply the highest ratings to all instances of each player
    Object.keys(teams).forEach(teamKey => {
        const team = teams[teamKey];
        team.players.forEach(player => {
            if (playerRatings[player.name]) {
                player.batting = playerRatings[player.name].batting;
                player.bowling = playerRatings[player.name].bowling;
            }
        });
    });

    console.log('Player ratings normalized - applied highest ratings across all teams');
}

// Run validation on window load so UI elements exist
window.addEventListener('load', () => {
    try {
        normalizePlayerRatings();
        assignBattingCategories();
        validateSquads();
    } catch (e) {
        console.error('Error during initialization:', e);
    }
});

// Dynamically assign personalized batting categories to players
function assignBattingCategories() {
    const customRoles = {
        // India
        'Rohit Sharma': 'opener', 'Yashasvi Jaiswal': 'opener', 'Shubman Gill': 'opener', 'Ruturaj Gaikwad': 'opener', 'Ishan Kishan': 'opener',
        'Virat Kohli': 'top order', 'Suryakumar Yadav': 'top order', 'Sanju Samson': 'top order', 'Rajat Patidar': 'top order',
        'Shreyas Iyer': 'middle order', 'KL Rahul': 'middle order', 'Rishabh Pant': 'middle order', 'Hardik Pandya': 'middle order', 'Rinku Singh': 'middle order', 'Shivam Dube': 'middle order', 'Tilak Varma': 'middle order', 'Jitesh Sharma': 'middle order', 'Priyansh Arya': 'middle order',
        'Ravindra Jadeja': 'lower order', 'Axar Patel': 'lower order', 'Washington Sundar': 'lower order', 'Venkatesh Iyer': 'middle order', 'Shahbaz Ahmed': 'lower order', 'Abhishek Sharma': 'opener', 'Nitish Kumar Reddy': 'middle order',

        // Australia
        'David Warner': 'opener', 'Travis Head': 'opener', 'Usman Khawaja': 'opener', 'Sam Konstas': 'opener', 'Nathan McSweeney': 'top order',
        'Steve Smith': 'top order', 'Marnus Labuschagne': 'top order', 'Mitchell Marsh': 'top order',
        'Glenn Maxwell': 'middle order', 'Cameron Green': 'middle order', 'Josh Inglis': 'middle order', 'Alex Carey': 'middle order', 'Marcus Stoinis': 'middle order',
        'Sean Abbott': 'lower order', 'Ashton Agar': 'lower order',

        // England
        'Jos Buttler': 'opener', 'Jonny Bairstow': 'opener', 'Phil Salt': 'opener', 'Zak Crawley': 'opener', 'Ben Duckett': 'opener',
        'Ollie Pope': 'top order', 'Harry Brook': 'middle order', 'Ben Stokes': 'middle order', 'Moeen Ali': 'middle order', 'Liam Livingstone': 'middle order', 'Sam Curran': 'lower order', 'Will Jacks': 'top order',

        // South Africa
        'Quinton de Kock': 'opener', 'Temba Bavuma': 'opener', 'Reeza Hendricks': 'opener', 'Ryan Rickelton': 'opener',
        'Aiden Markram': 'top order', 'Rassie van der Dussen': 'top order',
        'Heinrich Klaasen': 'middle order', 'Tristan Stubbs': 'middle order',
        'Marco Jansen': 'lower order', 'Andile Phehlukwayo': 'lower order', 'Dwaine Pretorius': 'lower order', 'Wiaan Mulder': 'lower order',

        // New Zealand
        'Devon Conway': 'opener', 'Finn Allen': 'opener', 'Tom Latham': 'opener',
        'Kane Williamson': 'top order', 'Rachin Ravindra': 'top order',
        'Glenn Phillips': 'middle order', 'Daryl Mitchell': 'middle order', 'James Neesham': 'middle order', 'Mark Chapman': 'middle order', 'Tim Seifert': 'middle order',
        'Mitchell Santner': 'lower order', 'Michael Bracewell': 'lower order',

        // Pakistan
        'Mohammad Rizwan': 'opener', 'Fakhar Zaman': 'opener', 'Imam-ul-Haq': 'opener', 'Saim Ayub': 'opener', 'Abdullah Shafique': 'opener', 'Sahibzada Farhan': 'opener',
        'Babar Azam': 'top order', 'Shan Masood': 'top order',
        'Shadab Khan': 'middle order', 'Agha Salman': 'middle order', 'Sarfaraz Ahmed': 'middle order',
        'Imad Wasim': 'lower order', 'Faheem Ashraf': 'lower order',

        // Sri Lanka
        'Dimuth Karunaratne': 'opener', 'Pathum Nissanka': 'opener', 'Avishka Fernando': 'opener',
        'Kusal Mendis': 'top order', 'Sadeera Samarawickrama': 'top order',
        'Charith Asalanka': 'middle order', 'Dasun Shanaka': 'middle order', 'Angelo Mathews': 'middle order',
        'Dhananjaya de Silva': 'middle order', 'Wanindu Hasaranga': 'lower order', 'Chamika Karunaratne': 'lower order', 'Dunith Wellalage': 'lower order',

        // Bangladesh
        'Tamim Iqbal': 'opener', 'Litton Das': 'opener', 'Anamul Haque': 'opener',
        'Najmul Hossain Shanto': 'top order', 'Towhid Hridoy': 'middle order', 'Mushfiqur Rahim': 'middle order', 'Yasir Ali': 'middle order', 'Nurul Hasan': 'middle order',
        'Mehidy Hasan Miraz': 'lower order', 'Mosaddek Hossain': 'middle order', 'Mahedi Hasan': 'lower order'
    };

    Object.keys(teams).forEach(teamKey => {
        const team = teams[teamKey];
        let batterCount = 0;
        let allrounderCount = 0;

        team.players.forEach(player => {
            if (customRoles[player.name]) {
                player.battingCategory = customRoles[player.name];
            } else {
                // Fallback for players not in the explicit dictionary
                if (['batsman', 'wicketkeeper'].includes(player.role)) {
                    if (batterCount < 2) player.battingCategory = 'opener';
                    else if (batterCount < 5) player.battingCategory = 'top order';
                    else player.battingCategory = 'middle order';
                    batterCount++;
                } else if (player.role === 'allrounder') {
                    if (allrounderCount < 1) player.battingCategory = 'middle order';
                    else player.battingCategory = 'lower order';
                    allrounderCount++;
                } else {
                    player.battingCategory = 'lower order';
                }
            }
        });
    });
    console.log('Classifications actively personalized to key players');
}

const teams = {
    india: {
        name: 'India',
        players: [
            // Batsmen
            { name: 'Rohit Sharma', role: 'batsman', batting: 85, bowling: 20, captain: true },
            { name: 'Virat Kohli', role: 'batsman', batting: 88, bowling: 25 },
            { name: 'KL Rahul', role: 'wicketkeeper', batting: 85, bowling: 15 },
            { name: 'Shubman Gill', role: 'batsman', batting: 80, bowling: 10 },
            { name: 'Shreyas Iyer', role: 'batsman', batting: 84, bowling: 20 },
            { name: 'Yashasvi Jaiswal', role: 'batsman', batting: 78, bowling: 20 },
            { name: 'Suryakumar Yadav', role: 'batsman', batting: 80, bowling: 25 },
            { name: 'Priyansh Arya', role: 'batsman', batting: 68, bowling: 25 },
            { name: 'Ruturaj Gaikwad', role: 'batsman', batting: 77, bowling: 10 },
            { name: 'Ishan Kishan', role: 'wicketkeeper', batting: 79, bowling: 5 },
            { name: 'Rishabh Pant', role: 'wicketkeeper', batting: 80, bowling: 5 },
            { name: 'Sanju Samson', role: 'wicketkeeper', batting: 76, bowling: 5 },
            { name: 'Jitesh Sharma', role: 'wicketkeeper', batting: 74, bowling: 5 },
            { name: 'Tilak Varma', role: 'batsman', batting: 75, bowling: 15 },
            { name: 'Rajat Patidar', role: 'batsman', batting: 75, bowling: 15 },
            { name: 'Rinku Singh', role: 'batsman', batting: 73, bowling: 10 },
            { name: 'Prithvi Shaw', role: 'batsman', batting: 75, bowling: 15 },
            // All-rounders
            { name: 'Hardik Pandya', role: 'allrounder', batting: 75, bowling: 78 },
            { name: 'Ravindra Jadeja', role: 'allrounder', batting: 72, bowling: 82 },
            { name: 'Axar Patel', role: 'allrounder', batting: 65, bowling: 80 },
            { name: 'Washington Sundar', role: 'allrounder', batting: 68, bowling: 75 },
            { name: 'Shivam Dube', role: 'allrounder', batting: 72, bowling: 68 },
            { name: 'Venkatesh Iyer', role: 'allrounder', batting: 70, bowling: 72 },
            { name: 'Shahbaz Ahmed', role: 'allrounder', batting: 66, bowling: 70 },
            { name: 'Abhishek Sharma', role: 'allrounder', batting: 69, bowling: 65 },
            { name: 'Nitish Kumar Reddy', role: 'allrounder', batting: 64, bowling: 68 },



            // Bowlers
            { name: 'Jasprit Bumrah', role: 'bowler', batting: 25, bowling: 90, bowlingStyle: 'fastBowler', strongVariation: 'yorker', weakVariation: 'shortPitch' },
            { name: 'Mohammed Shami', role: 'bowler', batting: 20, bowling: 85, bowlingStyle: 'fastBowler', strongVariation: 'inswinger', weakVariation: 'shortPitch' },
            { name: 'Mohammed Siraj', role: 'bowler', batting: 15, bowling: 84, bowlingStyle: 'fastBowler', strongVariation: 'outswinger', weakVariation: 'yorker' },
            { name: 'Arshdeep Singh', role: 'bowler', batting: 18, bowling: 85, bowlingStyle: 'fastBowler', strongVariation: 'outswinger', weakVariation: 'longPitch' },
            { name: 'Yuzvendra Chahal', role: 'bowler', batting: 12, bowling: 83, bowlingStyle: 'legSpinner', strongVariation: 'legBreak', weakVariation: 'googly' },
            { name: 'Kuldeep Yadav', role: 'bowler', batting: 10, bowling: 81, bowlingStyle: 'leftArmSpinner', strongVariation: 'doosra', weakVariation: 'carrom' },
            { name: 'Ravi Bishnoi', role: 'bowler', batting: 8, bowling: 79, bowlingStyle: 'legSpinner', strongVariation: 'legBreak', weakVariation: 'flipper' },
            { name: 'Prasidh Krishna', role: 'bowler', batting: 5, bowling: 82, bowlingStyle: 'fastBowler', strongVariation: 'bouncer', weakVariation: 'fullLength' },
            { name: 'Avesh Khan', role: 'bowler', batting: 7, bowling: 77, bowlingStyle: 'fastBowler', strongVariation: 'inswinger', weakVariation: 'slips' },
            { name: 'Mayank Yadav', role: 'bowler', batting: 6, bowling: 80, bowlingStyle: 'fastBowler', strongVariation: 'shortPitch', weakVariation: 'fullLength' },
            { name: 'Mukesh Kumar', role: 'bowler', batting: 9, bowling: 76, bowlingStyle: 'fastBowler', strongVariation: 'outswinger', weakVariation: 'yorker' },
            { name: 'Harshal Patel', role: 'bowler', batting: 13, bowling: 75, bowlingStyle: 'fastBowler', strongVariation: 'yorker', weakVariation: 'fullLength' },
            { name: 'Suyash Sharma', role: 'bowler', batting: 4, bowling: 73, bowlingStyle: 'leftArmSpinner', strongVariation: 'armBall', weakVariation: 'doosra' },
            { name: 'Varun Chakravarthy', role: 'bowler', batting: 8, bowling: 79, bowlingStyle: 'legSpinner', strongVariation: 'legBreak', weakVariation: 'googly' }
        ]
    },

    australia: {
        name: 'Australia',
        players: [
            // Batsmen
            { name: 'David Warner', role: 'batsman', batting: 84, bowling: 15, captain: true },
            { name: 'Steve Smith', role: 'batsman', batting: 86, bowling: 30 },
            { name: 'Marnus Labuschagne', role: 'batsman', batting: 82, bowling: 25 },
            { name: 'Travis Head', role: 'batsman', batting: 79, bowling: 20 },
            { name: 'Sam Konstas', role: 'batsman', batting: 77, bowling: 10 },
            { name: 'Nathan McSweeney', role: 'batsman', batting: 75, bowling: 15 },
            { name: 'Usman Khawaja', role: 'batsman', batting: 81, bowling: 15 },
            { name: 'Cameron Green', role: 'allrounder', batting: 76, bowling: 80 },
            { name: 'Marcus Stoinis', role: 'allrounder', batting: 74, bowling: 75 },
            { name: 'Alex Carey', role: 'wicketkeeper', batting: 72, bowling: 5 },
            { name: 'Josh Inglis', role: 'wicketkeeper', batting: 70, bowling: 5 },
            { name: 'Cameron Bancroft', role: 'batsman', batting: 74, bowling: 10 },
            { name: 'Matt Renshaw', role: 'batsman', batting: 73, bowling: 10 },
            { name: 'Henry Hunt', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'William Pucovski', role: 'batsman', batting: 76, bowling: 10 },
            { name: 'Matthew Wade', role: 'wicketkeeper', batting: 70, bowling: 5 },
            { name: 'Aaron Hardie', role: 'allrounder', batting: 70, bowling: 70 },




            // All-rounders
            { name: 'Glenn Maxwell', role: 'allrounder', batting: 81, bowling: 70 },
            { name: 'Mitchell Marsh', role: 'allrounder', batting: 73, bowling: 78 },
            { name: 'Sean Abbott', role: 'allrounder', batting: 65, bowling: 76 },
            { name: 'Ashton Agar', role: 'allrounder', batting: 60, bowling: 75 },

            // Bowlers
            { name: 'Pat Cummins', role: 'bowler', batting: 35, bowling: 88, bowlingStyle: 'fastBowler', strongVariation: 'bouncer', weakVariation: 'fullLength' },
            { name: 'Mitchell Starc', role: 'bowler', batting: 25, bowling: 87, bowlingStyle: 'fastBowler', strongVariation: 'yorker', weakVariation: 'shortPitch' },
            { name: 'Josh Hazlewood', role: 'bowler', batting: 20, bowling: 85, bowlingStyle: 'fastBowler', strongVariation: 'outswinger', weakVariation: 'longPitch' },
            { name: 'Adam Zampa', role: 'bowler', batting: 15, bowling: 82, bowlingStyle: 'legSpinner', strongVariation: 'googly', weakVariation: 'legBreak' },
            { name: 'Nathan Lyon', role: 'bowler', batting: 12, bowling: 84, bowlingStyle: 'offSpinner', strongVariation: 'offBreak', weakVariation: 'armBall' },
            { name: 'Todd Murphy', role: 'bowler', batting: 8, bowling: 78, bowlingStyle: 'legSpinner', strongVariation: 'flipper', weakVariation: 'googly' },
            { name: 'Lance Morris', role: 'bowler', batting: 5, bowling: 80, bowlingStyle: 'fastBowler', strongVariation: 'shortPitch', weakVariation: 'yorker' },
            { name: 'Scott Boland', role: 'bowler', batting: 10, bowling: 83, bowlingStyle: 'fastBowler', strongVariation: 'inswinger', weakVariation: 'outswinger' },
            { name: 'Jason Behrendorff', role: 'bowler', batting: 10, bowling: 75, bowlingStyle: 'fastBowler', strongVariation: 'yorker', weakVariation: 'shortPitch' },
            { name: 'Andrew Tye', role: 'bowler', batting: 10, bowling: 75, bowlingStyle: 'fastBowler', strongVariation: 'yorker', weakVariation: 'shortPitch' },
            { name: 'Riley Meredith', role: 'bowler', batting: 10, bowling: 75, bowlingStyle: 'fastBowler', strongVariation: 'yorker', weakVariation: 'shortPitch' },
            { name: 'Xavier Bartlett', role: 'bowler', batting: 10, bowling: 75, bowlingStyle: 'fastBowler', strongVariation: 'yorker', weakVariation: 'shortPitch' }
        ]
    },

    england: {
        name: 'England',
        players: [
            // Batsmen
            { name: 'Jos Buttler', role: 'wicketkeeper', batting: 85, bowling: 5, captain: true },
            { name: 'Jonny Bairstow', role: 'wicketkeeper', batting: 83, bowling: 5 },
            { name: 'Joe Root', role: 'batsman', batting: 83, bowling: 65 },
            { name: 'Harry Brook', role: 'batsman', batting: 80, bowling: 15 },
            { name: 'Ben Duckett', role: 'batsman', batting: 77, bowling: 10 },
            { name: 'Ollie Pope', role: 'batsman', batting: 75, bowling: 20 },
            { name: 'Zak Crawley', role: 'batsman', batting: 72, bowling: 15 },
            { name: 'Phil Salt', role: 'wicketkeeper', batting: 78, bowling: 5 },

            // All-rounders
            { name: 'Ben Stokes', role: 'allrounder', batting: 82, bowling: 85 },
            { name: 'Moeen Ali', role: 'allrounder', batting: 73, bowling: 78 },
            { name: 'Liam Livingstone', role: 'allrounder', batting: 76, bowling: 72 },
            { name: 'Sam Curran', role: 'allrounder', batting: 68, bowling: 75 },
            { name: 'Will Jacks', role: 'allrounder', batting: 74, bowling: 70 },

            // Bowlers
            { name: 'Jofra Archer', role: 'bowler', batting: 25, bowling: 88, bowlingStyle: 'fastBowler', strongVariation: 'bouncer', weakVariation: 'fullLength' },
            { name: 'Mark Wood', role: 'bowler', batting: 20, bowling: 86, bowlingStyle: 'fastBowler', strongVariation: 'shortPitch', weakVariation: 'yorker' },
            { name: 'Chris Woakes', role: 'bowler', batting: 35, bowling: 82, bowlingStyle: 'fastBowler', strongVariation: 'inswinger', weakVariation: 'outswinger' },
            { name: 'Adil Rashid', role: 'bowler', batting: 15, bowling: 83, bowlingStyle: 'legSpinner', strongVariation: 'googly', weakVariation: 'legBreak' },
            { name: 'Jack Leach', role: 'bowler', batting: 12, bowling: 80, bowlingStyle: 'leftArmSpinner', strongVariation: 'doosra', weakVariation: 'armBall' },
            { name: 'Reece Topley', role: 'bowler', batting: 8, bowling: 78, bowlingStyle: 'fastBowler', strongVariation: 'outswinger', weakVariation: 'longPitch' },
            { name: 'Gus Atkinson', role: 'bowler', batting: 5, bowling: 81, bowlingStyle: 'fastBowler', strongVariation: 'yorker', weakVariation: 'shortPitch' },
            { name: 'Brydon Carse', role: 'bowler', batting: 10, bowling: 79, bowlingStyle: 'fastBowler', strongVariation: 'bouncer', weakVariation: 'fullLength' },
            { name: 'Rehan Ahmed', role: 'bowler', batting: 25, bowling: 77, bowlingStyle: 'legSpinner', strongVariation: 'flipper', weakVariation: 'googly' },
            { name: 'Craig Overton', role: 'bowler', batting: 10, bowling: 75, bowlingStyle: 'fastBowler', strongVariation: 'yorker', weakVariation: 'shortPitch' },
            { name: 'Tymal Mills', role: 'bowler', batting: 10, bowling: 75, bowlingStyle: 'fastBowler', strongVariation: 'yorker', weakVariation: 'shortPitch' }
        ]
    },

    southafrica: {
        name: 'South Africa',
        players: [
            // Batsmen
            { name: 'Temba Bavuma', role: 'batsman', batting: 78, bowling: 15, captain: true },
            { name: 'Aiden Markram', role: 'batsman', batting: 81, bowling: 25 },
            { name: 'Rassie van der Dussen', role: 'batsman', batting: 79, bowling: 20 },
            { name: 'Heinrich Klaasen', role: 'wicketkeeper', batting: 80, bowling: 5 },
            { name: 'Quinton de Kock', role: 'wicketkeeper', batting: 82, bowling: 5 },
            { name: 'Reeza Hendricks', role: 'batsman', batting: 75, bowling: 15 },
            { name: 'Tristan Stubbs', role: 'batsman', batting: 73, bowling: 20 },
            { name: 'Ryan Rickelton', role: 'wicketkeeper', batting: 71, bowling: 5 },

            // All-rounders
            { name: 'Marco Jansen', role: 'allrounder', batting: 65, bowling: 82 },
            { name: 'Andile Phehlukwayo', role: 'allrounder', batting: 68, bowling: 75 },
            { name: 'Dwaine Pretorius', role: 'allrounder', batting: 62, bowling: 76 },
            { name: 'Wiaan Mulder', role: 'allrounder', batting: 76, bowling: 74 },
            { name: 'Junior Dala', role: 'allrounder', batting: 64, bowling: 73 },

            // Bowlers
            { name: 'Kagiso Rabada', role: 'bowler', batting: 25, bowling: 87, bowlingStyle: 'fastBowler', strongVariation: 'yorker', weakVariation: 'shortPitch' },
            { name: 'Anrich Nortje', role: 'bowler', batting: 15, bowling: 86, bowlingStyle: 'fastBowler', strongVariation: 'bouncer', weakVariation: 'fullLength' },
            { name: 'Lungi Ngidi', role: 'bowler', batting: 20, bowling: 83, bowlingStyle: 'fastBowler', strongVariation: 'outswinger', weakVariation: 'yorker' },
            { name: 'Keshav Maharaj', role: 'bowler', batting: 18, bowling: 84, bowlingStyle: 'leftArmSpinner', strongVariation: 'doosra', weakVariation: 'armBall' },
            { name: 'Tabraiz Shamsi', role: 'bowler', batting: 12, bowling: 82, bowlingStyle: 'legSpinner', strongVariation: 'googly', weakVariation: 'legBreak' },
            { name: 'Gerald Coetzee', role: 'bowler', batting: 8, bowling: 80, bowlingStyle: 'fastBowler', strongVariation: 'inswinger', weakVariation: 'outswinger' },
            { name: 'Lizaad Williams', role: 'bowler', batting: 5, bowling: 78, bowlingStyle: 'fastBowler', strongVariation: 'shortPitch', weakVariation: 'fullLength' },
            { name: 'Bjorn Fortuin', role: 'bowler', batting: 10, bowling: 76, bowlingStyle: 'leftArmSpinner', strongVariation: 'armBall', weakVariation: 'doosra' },
            { name: 'Ottneil Baartman', role: 'bowler', batting: 10, bowling: 78 },

        ]
    },

    newzealand: {
        name: 'New Zealand',
        players: [
            // Batsmen
            { name: 'Kane Williamson', role: 'batsman', batting: 86, bowling: 25, captain: true },
            { name: 'Devon Conway', role: 'wicketkeeper', batting: 81, bowling: 5 },
            { name: 'Tom Latham', role: 'wicketkeeper', batting: 78, bowling: 5 },
            { name: 'Glenn Phillips', role: 'batsman', batting: 79, bowling: 20 },
            { name: 'Finn Allen', role: 'batsman', batting: 76, bowling: 15 },
            { name: 'Mark Chapman', role: 'batsman', batting: 74, bowling: 25 },
            { name: 'Tim Seifert', role: 'wicketkeeper', batting: 72, bowling: 5 },
            { name: 'Henry Nicholls', role: 'batsman', batting: 72, bowling: 5 },
            { name: 'Will Young', role: 'batsman', batting: 72, bowling: 5 },
            { name: 'Tom Blundell', role: 'wicketkeeper', batting: 72, bowling: 5 },

            // All-rounders
            { name: 'Mitchell Santner', role: 'allrounder', batting: 68, bowling: 80 },
            { name: 'James Neesham', role: 'allrounder', batting: 71, bowling: 72 },
            { name: 'Rachin Ravindra', role: 'allrounder', batting: 69, bowling: 75 },
            { name: 'Michael Bracewell', role: 'allrounder', batting: 66, bowling: 73 },
            { name: 'Daryl Mitchell', role: 'allrounder', batting: 77, bowling: 70 },

            // Bowlers
            { name: 'Trent Boult', role: 'bowler', batting: 20, bowling: 86, bowlingStyle: 'fastBowler', strongVariation: 'outswinger', weakVariation: 'yorker' },
            { name: 'Tim Southee', role: 'bowler', batting: 25, bowling: 85, bowlingStyle: 'fastBowler', strongVariation: 'inswinger', weakVariation: 'shortPitch' },
            { name: 'Jacob Duffy', role: 'bowler', batting: 15, bowling: 82, bowlingStyle: 'fastBowler', strongVariation: 'bouncer', weakVariation: 'fullLength' },
            { name: 'Lockie Ferguson', role: 'bowler', batting: 15, bowling: 84, bowlingStyle: 'fastBowler', strongVariation: 'shortPitch', weakVariation: 'yorker' },
            { name: 'Ish Sodhi', role: 'bowler', batting: 12, bowling: 81, bowlingStyle: 'legSpinner', strongVariation: 'googly', weakVariation: 'legBreak' },
            { name: 'Matt Henry', role: 'bowler', batting: 18, bowling: 83, bowlingStyle: 'fastBowler', strongVariation: 'yorker', weakVariation: 'shortPitch' },
            { name: 'Adam Milne', role: 'bowler', batting: 8, bowling: 79, bowlingStyle: 'fastBowler', strongVariation: 'bouncer', weakVariation: 'fullLength' },
            { name: 'Blair Tickner', role: 'bowler', batting: 5, bowling: 77, bowlingStyle: 'fastBowler', strongVariation: 'outswinger', weakVariation: 'longPitch' },
            { name: 'Ben Sears', role: 'bowler', batting: 10, bowling: 78, bowlingStyle: 'fastBowler', strongVariation: 'inswinger', weakVariation: 'outswinger' }
        ]
    },
    pakistan: {
        name: 'Pakistan',
        players: [
            // Batsmen
            { name: 'Babar Azam', role: 'batsman', batting: 83, bowling: 20, captain: true },
            { name: 'Imam-ul-Haq', role: 'batsman', batting: 80, bowling: 10 },
            { name: 'Abdullah Shafique', role: 'batsman', batting: 78, bowling: 10 },
            { name: 'Sahibzada Farhan', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Fakhar Zaman', role: 'batsman', batting: 81, bowling: 15 },
            { name: 'Shan Masood', role: 'batsman', batting: 76, bowling: 10 },
            { name: 'Saim Ayub', role: 'batsman', batting: 75, bowling: 10 },
            { name: 'Mohammad Rizwan', role: 'wicketkeeper', batting: 83, bowling: 5 },
            { name: 'Sarfaraz Ahmed', role: 'wicketkeeper', batting: 74, bowling: 5 },
            // All-rounders
            { name: 'Shadab Khan', role: 'allrounder', batting: 70, bowling: 80 },
            { name: 'Imad Wasim', role: 'allrounder', batting: 68, bowling: 78 },
            { name: 'Faheem Ashraf', role: 'allrounder', batting: 65, bowling: 76 },
            { name: 'Agha Salman', role: 'allrounder', batting: 67, bowling: 70 },
            // Bowlers
            { name: 'Shaheen Afridi', role: 'bowler', batting: 20, bowling: 90 },
            { name: 'Haris Rauf', role: 'bowler', batting: 15, bowling: 86 },
            { name: 'Naseem Shah', role: 'bowler', batting: 12, bowling: 84 },
            { name: 'Hasan Ali', role: 'bowler', batting: 18, bowling: 82 },
            { name: 'Mohammad Wasim Jr', role: 'bowler', batting: 10, bowling: 80 },
            { name: 'Abrar Ahmed', role: 'bowler', batting: 8, bowling: 78 },
            { name: 'Usama Mir', role: 'bowler', batting: 5, bowling: 77 },
            { name: 'Zaman Khan', role: 'bowler', batting: 7, bowling: 79 },
            { name: 'Usman Tariq', role: 'bowler', batting: 10, bowling: 76 },


        ]
    },
    srilanka: {
        name: 'Sri Lanka',
        players: [
            // Batsmen
            { name: 'Dimuth Karunaratne', role: 'batsman', batting: 80, bowling: 10, captain: true },
            { name: 'Pathum Nissanka', role: 'batsman', batting: 78, bowling: 10 },
            { name: 'Kusal Mendis', role: 'wicketkeeper', batting: 82, bowling: 5 },
            { name: 'Charith Asalanka', role: 'batsman', batting: 76, bowling: 15 },
            { name: 'Avishka Fernando', role: 'batsman', batting: 75, bowling: 10 },
            { name: 'Sadeera Samarawickrama', role: 'wicketkeeper', batting: 73, bowling: 5 },

            // All-rounders
            { name: 'Dasun Shanaka', role: 'allrounder', batting: 70, bowling: 75 },
            { name: 'Dhananjaya de Silva', role: 'allrounder', batting: 74, bowling: 70 },
            { name: 'Angelo Mathews', role: 'allrounder', batting: 78, bowling: 65 },
            { name: 'Wanindu Hasaranga', role: 'allrounder', batting: 68, bowling: 80 },
            { name: 'Chamika Karunaratne', role: 'allrounder', batting: 65, bowling: 74 },
            { name: 'Dunith Wellalage', role: 'allrounder', batting: 62, bowling: 76 },
            // Bowlers
            { name: 'Maheesh Theekshana', role: 'bowler', batting: 15, bowling: 82 },
            { name: 'Kasun Rajitha', role: 'bowler', batting: 10, bowling: 80 },
            { name: 'Dilshan Madushanka', role: 'bowler', batting: 8, bowling: 78 },
            { name: 'Matheesha Pathirana', role: 'bowler', batting: 5, bowling: 77 },
            { name: 'Lahiru Kumara', role: 'bowler', batting: 12, bowling: 81 },
            { name: 'Pramod Madushan', role: 'bowler', batting: 7, bowling: 79 },
            { name: 'Jeffrey Vandersay', role: 'bowler', batting: 6, bowling: 78 },
            { name: 'Binura Fernando', role: 'bowler', batting: 9, bowling: 77 }
        ]
    },
    bangladesh: {
        name: 'Bangladesh',
        players: [
            // Batsmen
            { name: 'Tamim Iqbal', role: 'batsman', batting: 82, bowling: 10, captain: true },
            { name: 'Litton Das', role: 'wicketkeeper', batting: 80, bowling: 5 },
            { name: 'Najmul Hossain Shanto', role: 'batsman', batting: 78, bowling: 10 },
            { name: 'Towhid Hridoy', role: 'batsman', batting: 75, bowling: 10 },
            { name: 'Mushfiqur Rahim', role: 'wicketkeeper', batting: 79, bowling: 5 },
            { name: 'Anamul Haque', role: 'batsman', batting: 73, bowling: 10 },
            { name: 'Yasir Ali', role: 'batsman', batting: 71, bowling: 10 },
            { name: 'Nurul Hasan', role: 'wicketkeeper', batting: 72, bowling: 5 },
            // All-rounders
            { name: 'Mehidy Hasan Miraz', role: 'allrounder', batting: 68, bowling: 75 },
            { name: 'Mosaddek Hossain', role: 'allrounder', batting: 65, bowling: 70 },
            { name: 'Mahedi Hasan', role: 'allrounder', batting: 62, bowling: 72 },
            { name: 'Soumya Sarkar', role: 'allrounder', batting: 67, bowling: 68 },
            { name: 'Nazmul Hossain Shanto', role: 'allrounder', batting: 64, bowling: 65 },
            { name: 'Rony Talukdar', role: 'allrounder', batting: 66, bowling: 62 },
            { name: 'Mahmudullah', role: 'allrounder', batting: 76, bowling: 65 },
            { name: 'Shakib Al Hasan', role: 'allrounder', batting: 80, bowling: 80 },
            { name: 'Afif Hossain', role: 'allrounder', batting: 70, bowling: 60 },

            // Bowlers
            { name: 'Taskin Ahmed', role: 'bowler', batting: 15, bowling: 82 },
            { name: 'Mustafizur Rahman', role: 'bowler', batting: 10, bowling: 80 },
            { name: 'Shoriful Islam', role: 'bowler', batting: 8, bowling: 78 },
            { name: 'Hasan Mahmud', role: 'bowler', batting: 5, bowling: 77 },
            { name: 'Ebadot Hossain', role: 'bowler', batting: 12, bowling: 81 },
            { name: 'Nasum Ahmed', role: 'bowler', batting: 7, bowling: 79 },
            { name: 'Taijul Islam', role: 'bowler', batting: 6, bowling: 78 },
            { name: 'Khaled Ahmed', role: 'bowler', batting: 9, bowling: 77 },
            { name: 'Rejaur Rahman', role: 'bowler', batting: 4, bowling: 76 },
            { name: 'Rakibul Hasan', role: 'bowler', batting: 3, bowling: 75 }
        ]
    },
    westindies: {
        name: 'West Indies',
        players: [
            // Batsmen
            { name: 'Kraigg Brathwaite', role: 'batsman', batting: 78, bowling: 15, captain: true },
            { name: 'Shai Hope', role: 'wicketkeeper', batting: 82, bowling: 5 },
            { name: 'Brandon King', role: 'batsman', batting: 79, bowling: 10 },
            { name: 'Nicholas Pooran', role: 'wicketkeeper', batting: 81, bowling: 5 },
            { name: 'Rovman Powell', role: 'batsman', batting: 77, bowling: 15 },
            { name: 'Shimron Hetmyer', role: 'batsman', batting: 80, bowling: 10 },
            { name: 'Johnson Charles', role: 'wicketkeeper', batting: 74, bowling: 5 },
            { name: 'Tagenarine Chanderpaul', role: 'batsman', batting: 75, bowling: 10 },
            { name: 'Kirk McKenzie', role: 'batsman', batting: 73, bowling: 10 },
            { name: 'Alick Athanaze', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Joshua Da Silva', role: 'wicketkeeper', batting: 71, bowling: 5 },

            // All-rounders
            { name: 'Jason Holder', role: 'allrounder', batting: 75, bowling: 82 },
            { name: 'Andre Russell', role: 'allrounder', batting: 83, bowling: 78 },
            { name: 'Romario Shepherd', role: 'allrounder', batting: 70, bowling: 75 },
            { name: 'Odean Smith', role: 'allrounder', batting: 68, bowling: 76 },
            { name: 'Raymon Reifer', role: 'allrounder', batting: 65, bowling: 70 },
            { name: 'Keacy Carty', role: 'allrounder', batting: 67, bowling: 65 },
            { name: 'Justin Greaves', role: 'allrounder', batting: 64, bowling: 68 },
            { name: 'Kyle Mayers', role: 'allrounder', batting: 76, bowling: 75 },
            // Bowlers
            { name: 'Alzarri Joseph', role: 'bowler', batting: 20, bowling: 85, bowlingStyle: 'fastBowler', strongVariation: 'bouncer', weakVariation: 'fullLength' },
            { name: 'Kemar Roach', role: 'bowler', batting: 15, bowling: 83, bowlingStyle: 'fastBowler', strongVariation: 'outswinger', weakVariation: 'yorker' },
            { name: 'Shannon Gabriel', role: 'bowler', batting: 12, bowling: 81, bowlingStyle: 'fastBowler', strongVariation: 'shortPitch', weakVariation: 'inswinger' },
            { name: 'Akeal Hosein', role: 'bowler', batting: 18, bowling: 79, bowlingStyle: 'leftArmSpinner', strongVariation: 'doosra', weakVariation: 'armBall' },
            { name: 'Gudakesh Motie', role: 'bowler', batting: 10, bowling: 77, bowlingStyle: 'leftArmSpinner', strongVariation: 'armBall', weakVariation: 'doosra' },
            { name: 'Yannic Cariah', role: 'bowler', batting: 8, bowling: 76, bowlingStyle: 'legSpinner', strongVariation: 'googly', weakVariation: 'legBreak' },
            { name: 'Jair McAllister', role: 'bowler', batting: 5, bowling: 75, bowlingStyle: 'offSpinner', strongVariation: 'armBall', weakVariation: 'offBreak' },
            { name: 'Shamar Joseph', role: 'bowler', batting: 7, bowling: 78, bowlingStyle: 'fastBowler', strongVariation: 'yorker', weakVariation: 'shortPitch' },
            { name: 'Kevin Sinclair', role: 'bowler', batting: 6, bowling: 74, bowlingStyle: 'legSpinner', strongVariation: 'flipper', weakVariation: 'googly' }
        ]
    },
    afghanistan: {
        name: 'Afghanistan',
        players: [
            // Batsmen
            { name: 'Hashmatullah Shahidi', role: 'batsman', batting: 76, bowling: 15, captain: true },
            { name: 'Rahmanullah Gurbaz', role: 'wicketkeeper', batting: 79, bowling: 5 },
            { name: 'Ibrahim Zadran', role: 'batsman', batting: 78, bowling: 10 },
            { name: 'Rahmat Shah', role: 'batsman', batting: 77, bowling: 20 },
            { name: 'Najibullah Zadran', role: 'batsman', batting: 75, bowling: 15 },
            { name: 'Ikram Alikhil', role: 'wicketkeeper', batting: 73, bowling: 5 },
            { name: 'Usman Ghani', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Sediqullah Atal', role: 'batsman', batting: 71, bowling: 10 },
            { name: 'Ijaz Ahmadzai', role: 'batsman', batting: 70, bowling: 10 },
            { name: 'Darwish Rasooli', role: 'batsman', batting: 69, bowling: 10 },
            { name: 'Shahidullah Kamal', role: 'wicketkeeper', batting: 68, bowling: 5 },
            // All-rounders
            { name: 'Mohammad Nabi', role: 'allrounder', batting: 76, bowling: 80 },
            { name: 'Gulbadin Naib', role: 'allrounder', batting: 73, bowling: 75 },
            { name: 'Rashid Khan', role: 'allrounder', batting: 65, bowling: 88 },
            { name: 'Karim Janat', role: 'allrounder', batting: 67, bowling: 72 },
            { name: 'Sharafuddin Ashraf', role: 'allrounder', batting: 64, bowling: 70 },
            { name: 'Qais Ahmad', role: 'allrounder', batting: 62, bowling: 78 },
            { name: 'Noor Ahmad', role: 'allrounder', batting: 60, bowling: 75 },
            { name: 'Azmatullah Omarzai', role: 'allrounder', batting: 74, bowling: 75 },
            // Bowlers
            { name: 'Mujeeb Ur Rahman', role: 'bowler', batting: 15, bowling: 84 },
            { name: 'Fazalhaq Farooqi', role: 'bowler', batting: 12, bowling: 82 },
            { name: 'Naveen-ul-Haq', role: 'bowler', batting: 10, bowling: 80 },
            { name: 'Abdul Rahman', role: 'bowler', batting: 8, bowling: 78 },
            { name: 'Wafadar Momand', role: 'bowler', batting: 6, bowling: 76 },
            { name: 'Zia-ur-Rehman', role: 'bowler', batting: 5, bowling: 75 },
            { name: 'Sayed Shirzad', role: 'bowler', batting: 7, bowling: 77 },
            { name: 'Zahir Khan', role: 'bowler', batting: 4, bowling: 74 }
        ]
    },

    // IPL TEAMS
    rcb: {
        name: 'Royal Challengers Bengaluru',
        players: [
            { name: 'Virat Kohli', role: 'batsman', batting: 92, bowling: 10 },
            { name: 'Phil Salt', role: 'wicketkeeper', batting: 80, bowling: 5 },
            { name: 'Rajat Patidar', role: 'batsman', batting: 76, bowling: 10, captain: true },
            { name: 'Liam Livingstone', role: 'batsman', batting: 78, bowling: 70 },
            { name: 'Krunal Pandya', role: 'allrounder', batting: 70, bowling: 75 },
            { name: 'Jitesh Sharma', role: 'wicketkeeper', batting: 72, bowling: 5 },
            { name: 'Tim David', role: 'batsman', batting: 78, bowling: 8 },
            { name: 'Jacob Bethell', role: 'allrounder', batting: 72, bowling: 68 },
            { name: 'Romario Shepherd', role: 'allrounder', batting: 66, bowling: 76 },
            { name: 'Swapnil Singh', role: 'allrounder', batting: 62, bowling: 72 },
            { name: 'Josh Hazlewood', role: 'bowler', batting: 20, bowling: 85 },
            { name: 'Bhuvneshwar Kumar', role: 'bowler', batting: 18, bowling: 80 },
            { name: 'Yash Dayal', role: 'bowler', batting: 8, bowling: 74 },
            { name: 'Lungi Ngidi', role: 'bowler', batting: 15, bowling: 83 },
            { name: 'Suyash Sharma', role: 'bowler', batting: 10, bowling: 75 },
            { name: 'Nuwan Thushara', role: 'bowler', batting: 9, bowling: 77 },
            { name: 'Rasikh Dar', role: 'bowler', batting: 7, bowling: 73 },
            { name: 'Abhinandan Singh', role: 'bowler', batting: 6, bowling: 70 }
        ]
    },
    csk: {
        name: 'Chennai Super Kings',
        players: [
            { name: 'Ruturaj Gaikwad', role: 'batsman', batting: 82, bowling: 10, captain: true },
            { name: 'MS Dhoni', role: 'wicketkeeper', batting: 78, bowling: 5 },
            { name: 'Shivam Dube', role: 'allrounder', batting: 73, bowling: 68 },
            { name: 'Noor Ahmad', role: 'bowler', batting: 10, bowling: 77 },
            { name: 'Matheesha Pathirana', role: 'bowler', batting: 8, bowling: 80 },
            { name: 'Ravindra Jadeja', role: 'allrounder', batting: 70, bowling: 82 },
            { name: 'Devon Conway', role: 'wicketkeeper', batting: 81, bowling: 5 },
            { name: 'Rahul Tripathi', role: 'batsman', batting: 74, bowling: 10 },
            { name: 'Deepak Hooda', role: 'allrounder', batting: 68, bowling: 65 },
            { name: 'Sam Curran', role: 'allrounder', batting: 68, bowling: 75 },
            { name: 'Anshul Kamboj', role: 'allrounder', batting: 62, bowling: 72 },
            { name: 'Shaik Rasheed', role: 'batsman', batting: 70, bowling: 8 },
            { name: 'Andre Siddarth', role: 'batsman', batting: 70, bowling: 8 },
            { name: 'Vansh Bedi', role: 'wicketkeeper', batting: 65, bowling: 5 },
            { name: 'Spencer Johnson', role: 'bowler', batting: 7, bowling: 78 },
            { name: 'Jamie Overton', role: 'allrounder', batting: 65, bowling: 68 },
            { name: 'Nathan Ellis', role: 'bowler', batting: 10, bowling: 74 },
            { name: 'Kamlesh Nagarkoti', role: 'bowler', batting: 8, bowling: 72 }
        ]
    },
    mi: {
        name: 'Mumbai Indians',
        players: [
            { name: 'Rohit Sharma', role: 'batsman', batting: 87, bowling: 20 },
            { name: 'Suryakumar Yadav', role: 'batsman', batting: 85, bowling: 25 },
            { name: 'Tilak Varma', role: 'batsman', batting: 78, bowling: 10 },
            { name: 'Ryan Rickelton', role: 'wicketkeeper', batting: 74, bowling: 5 },
            { name: 'Naman Dhir', role: 'allrounder', batting: 66, bowling: 65 },
            { name: 'Robin Minz', role: 'wicketkeeper', batting: 70, bowling: 5 },
            { name: 'Will Jacks', role: 'allrounder', batting: 76, bowling: 72 },
            { name: 'Keshav Maharaj', role: 'allrounder', batting: 60, bowling: 80 },
            { name: 'Deepak Chahar', role: 'bowler', batting: 15, bowling: 80 },
            { name: 'Jasprit Bumrah', role: 'bowler', batting: 25, bowling: 91 },
            { name: 'Trent Boult', role: 'bowler', batting: 20, bowling: 86 },
            { name: 'Allah Ghazanfar', role: 'bowler', batting: 8, bowling: 72 },
            { name: 'Raj Bawa', role: 'allrounder', batting: 66, bowling: 65 },
            { name: 'Reece Topley', role: 'bowler', batting: 8, bowling: 79 },
            { name: 'Krishnan Shrijith', role: 'wicketkeeper', batting: 68, bowling: 5 },
            { name: 'Bevon Jacobs', role: 'batsman', batting: 70, bowling: 8 },
            { name: 'Satyanarayana Raju', role: 'bowler', batting: 6, bowling: 70 }
        ]
    },
    gt: {
        name: 'Gujarat Titans',
        players: [
            { name: 'Shubman Gill', role: 'batsman', batting: 82, bowling: 10, captain: true },
            { name: 'Jos Buttler', role: 'wicketkeeper', batting: 87, bowling: 5 },
            { name: 'Sai Sudharsan', role: 'batsman', batting: 77, bowling: 10 },
            { name: 'Shahrukh Khan', role: 'batsman', batting: 72, bowling: 8 },
            { name: 'Kagiso Rabada', role: 'bowler', batting: 25, bowling: 88 },
            { name: 'Mohammed Siraj', role: 'bowler', batting: 15, bowling: 82 },
            { name: 'Kumar Kushagra', role: 'wicketkeeper', batting: 72, bowling: 5 },
            { name: 'Washington Sundar', role: 'allrounder', batting: 68, bowling: 77 },
            { name: 'Rashid Khan', role: 'allrounder', batting: 70, bowling: 88 },
            { name: 'Rahul Tewatia', role: 'allrounder', batting: 68, bowling: 65 },
            { name: 'Prasidh Krishna', role: 'bowler', batting: 5, bowling: 84 },
            { name: 'Gerald Coetzee', role: 'bowler', batting: 8, bowling: 80 },
            { name: 'Nishant Sindhu', role: 'allrounder', batting: 65, bowling: 62 },
            { name: 'Connor Esterhuizen', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Manav Suthar', role: 'bowler', batting: 6, bowling: 74 },
            { name: 'Arshad Khan', role: 'bowler', batting: 8, bowling: 75 },
            { name: 'Gurnoor Brar', role: 'bowler', batting: 7, bowling: 77 },
            { name: 'Kulwant Khejroliya', role: 'bowler', batting: 6, bowling: 75 }
        ]
    },
    lsg: {
        name: 'Lucknow Super Giants',
        players: [
            { name: 'Rishabh Pant', role: 'wicketkeeper', batting: 85, bowling: 5, captain: true },
            { name: 'Mitchell Marsh', role: 'allrounder', batting: 76, bowling: 78 },
            { name: 'Ayush Badoni', role: 'batsman', batting: 74, bowling: 10 },
            { name: 'David Miller', role: 'batsman', batting: 82, bowling: 10 },
            { name: 'Nicholas Pooran', role: 'wicketkeeper', batting: 80, bowling: 5 },
            { name: 'Aiden Markram', role: 'batsman', batting: 80, bowling: 25 },
            { name: 'Abdul Samad', role: 'allrounder', batting: 66, bowling: 65 },
            { name: 'Shahbaz Ahmed', role: 'allrounder', batting: 65, bowling: 68 },
            { name: 'Ravi Bishnoi', role: 'bowler', batting: 8, bowling: 80 },
            { name: 'Mayank Yadav', role: 'bowler', batting: 8, bowling: 77 },
            { name: 'Shamar Joseph', role: 'bowler', batting: 8, bowling: 79 },
            { name: 'Avesh Khan', role: 'bowler', batting: 8, bowling: 78 },
            { name: 'Mohsin Khan', role: 'bowler', batting: 7, bowling: 74 },
            { name: 'Digvesh Singh', role: 'bowler', batting: 7, bowling: 70 },
            { name: 'M Siddharth', role: 'bowler', batting: 6, bowling: 75 },
            { name: 'Arjun Tendulkar', role: 'bowler', batting: 10, bowling: 72 },
            { name: 'Rajvardhan Hangargekar', role: 'bowler', batting: 8, bowling: 75 },
            { name: 'Akash Deep', role: 'bowler', batting: 7, bowling: 75 },
            { name: 'Prince Yadav', role: 'bowler', batting: 6, bowling: 70 }
        ]
    },
    dc: {
        name: 'Delhi Capitals',
        players: [
            { name: 'KL Rahul', role: 'wicketkeeper', batting: 86, bowling: 10, captain: true },
            { name: 'Prithvi Shaw', role: 'batsman', batting: 80, bowling: 10 },
            { name: 'Harry Brook', role: 'batsman', batting: 82, bowling: 15 },
            { name: 'Axar Patel', role: 'allrounder', batting: 66, bowling: 82 },
            { name: 'Tristan Stubbs', role: 'wicketkeeper', batting: 72, bowling: 5 },
            { name: 'Sameer Rizvi', role: 'batsman', batting: 72, bowling: 8 },
            { name: 'Ashutosh Sharma', role: 'batsman', batting: 71, bowling: 8 },
            { name: 'Vipraj Nigam', role: 'allrounder', batting: 62, bowling: 68 },
            { name: 'Kuldeep Yadav', role: 'bowler', batting: 10, bowling: 83 },
            { name: 'Mitchell Starc', role: 'bowler', batting: 25, bowling: 87 },
            { name: 'T Natarajan', role: 'bowler', batting: 8, bowling: 78 },
            { name: 'Mohit Sharma', role: 'bowler', batting: 8, bowling: 76 },
            { name: 'Mukesh Kumar', role: 'bowler', batting: 7, bowling: 72 },
            { name: 'Darshan Nalkande', role: 'bowler', batting: 7, bowling: 70 },
            { name: 'Donovan Ferreira', role: 'batsman', batting: 71, bowling: 8 },
            { name: 'Karun Nair', role: 'batsman', batting: 74, bowling: 10 },
            { name: 'Manvath Kumar', role: 'allrounder', batting: 62, bowling: 60 }
        ]
    },
    srh: {
        name: 'Sunrisers Hyderabad',
        players: [
            { name: 'Travis Head', role: 'batsman', batting: 82, bowling: 20 },
            { name: 'Abhishek Sharma', role: 'batsman', batting: 76, bowling: 65 },
            { name: 'Heinrich Klaasen', role: 'wicketkeeper', batting: 82, bowling: 5 },
            { name: 'Ishan Kishan', role: 'wicketkeeper', batting: 78, bowling: 5 },
            { name: 'Nitish Kumar Reddy', role: 'allrounder', batting: 72, bowling: 72 },
            { name: 'Pat Cummins', role: 'allrounder', batting: 40, bowling: 88, captain: true },
            { name: 'Mohammed Shami', role: 'bowler', batting: 20, bowling: 87 },
            { name: 'Harshal Patel', role: 'allrounder', batting: 55, bowling: 78 },
            { name: 'Adam Zampa', role: 'bowler', batting: 15, bowling: 82 },
            { name: 'Atharva Taide', role: 'batsman', batting: 72, bowling: 8 },
            { name: 'Rahul Chahar', role: 'bowler', batting: 10, bowling: 78 },
            { name: 'Zeeshan Ansari', role: 'bowler', batting: 7, bowling: 73 },
            { name: 'Simarjeet Singh', role: 'bowler', batting: 7, bowling: 72 },
            { name: 'Wiaan Mulder', role: 'allrounder', batting: 66, bowling: 74 },
            { name: 'Brydon Carse', role: 'allrounder', batting: 66, bowling: 76 },
            { name: 'Kamindu Mendis', role: 'allrounder', batting: 74, bowling: 65 },
            { name: 'Jaydev Unadkat', role: 'bowler', batting: 8, bowling: 74 },
            { name: 'Aniket Varma', role: 'batsman', batting: 70, bowling: 8 }
        ]
    },
    pbks: {
        name: 'Punjab Kings',
        players: [
            { name: 'Shreyas Iyer', role: 'batsman', batting: 80, bowling: 20, captain: true },
            { name: 'Prabhsimran Singh', role: 'wicketkeeper', batting: 76, bowling: 5 },
            { name: 'Nehal Wadhera', role: 'batsman', batting: 72, bowling: 8 },
            { name: 'Priyansh Arya', role: 'batsman', batting: 74, bowling: 8 },
            { name: 'Marcus Stoinis', role: 'allrounder', batting: 76, bowling: 75 },
            { name: 'Josh Inglis', role: 'wicketkeeper', batting: 74, bowling: 5 },
            { name: 'Shashank Singh', role: 'allrounder', batting: 70, bowling: 65 },
            { name: 'Marco Jansen', role: 'allrounder', batting: 66, bowling: 78 },
            { name: 'Arshdeep Singh', role: 'bowler', batting: 18, bowling: 82 },
            { name: 'Yuzvendra Chahal', role: 'bowler', batting: 12, bowling: 84 },
            { name: 'Lockie Ferguson', role: 'bowler', batting: 15, bowling: 84 },
            { name: 'Xavier Bartlett', role: 'bowler', batting: 7, bowling: 74 },
            { name: 'Suryansh Shedge', role: 'allrounder', batting: 62, bowling: 60 },
            { name: 'Azmatullah Omarzai', role: 'allrounder', batting: 66, bowling: 72 },
            { name: 'Pyla Avinash', role: 'batsman', batting: 70, bowling: 8 },
            { name: 'Harnoor Singh', role: 'batsman', batting: 68, bowling: 8 },
            { name: 'Musheer Khan', role: 'batsman', batting: 72, bowling: 8 },
            { name: 'Kuldeep Sen', role: 'bowler', batting: 8, bowling: 75 }
        ]
    },
    rr: {
        name: 'Rajasthan Royals',
        players: [
            { name: 'Sanju Samson', role: 'wicketkeeper', batting: 80, bowling: 5, captain: true },
            { name: 'Yashasvi Jaiswal', role: 'batsman', batting: 84, bowling: 10 },
            { name: 'Vaibhav Suryavanshi', role: 'batsman', batting: 76, bowling: 8 },
            { name: 'Riyan Parag', role: 'batsman', batting: 74, bowling: 65 },
            { name: 'Shimron Hetmyer', role: 'batsman', batting: 82, bowling: 10 },
            { name: 'Dhruv Jurel', role: 'wicketkeeper', batting: 72, bowling: 5 },
            { name: 'Wanindu Hasaranga', role: 'allrounder', batting: 68, bowling: 82 },
            { name: 'Maheesh Theekshana', role: 'bowler', batting: 15, bowling: 82 },
            { name: 'Jofra Archer', role: 'bowler', batting: 25, bowling: 89 },
            { name: 'Sandeep Sharma', role: 'bowler', batting: 8, bowling: 75 },
            { name: 'Shubham Dubey', role: 'batsman', batting: 70, bowling: 8 },
            { name: 'Nitish Rana', role: 'batsman', batting: 74, bowling: 10 },
            { name: 'Fazalhaq Farooqi', role: 'bowler', batting: 7, bowling: 76 },
            { name: 'Kwena Maphaka', role: 'bowler', batting: 7, bowling: 74 },
            { name: 'Akash Madhwal', role: 'bowler', batting: 7, bowling: 72 },
            { name: 'Kumar Kartikeya', role: 'bowler', batting: 7, bowling: 72 },
            { name: 'Yudhvir Singh', role: 'bowler', batting: 7, bowling: 70 },
            { name: 'Kunal Rathore', role: 'batsman', batting: 68, bowling: 8 }
        ]
    },
    kkr: {
        name: 'Kolkata Knight Riders',
        players: [
            { name: 'Venkatesh Iyer', role: 'batsman', batting: 74, bowling: 65, captain: true },
            { name: 'Quinton de Kock', role: 'wicketkeeper', batting: 84, bowling: 5 },
            { name: 'Angkrish Raghuvanshi', role: 'batsman', batting: 74, bowling: 8 },
            { name: 'Rinku Singh', role: 'batsman', batting: 76, bowling: 10 },
            { name: 'Andre Russell', role: 'allrounder', batting: 82, bowling: 76 },
            { name: 'Sunil Narine', role: 'allrounder', batting: 70, bowling: 82 },
            { name: 'Rahmanullah Gurbaz', role: 'wicketkeeper', batting: 76, bowling: 5 },
            { name: 'Varun Chakravarthy', role: 'bowler', batting: 8, bowling: 80 },
            { name: 'Harshit Rana', role: 'bowler', batting: 7, bowling: 76 },
            { name: 'Anrich Nortje', role: 'bowler', batting: 15, bowling: 82 },
            { name: 'Moeen Ali', role: 'allrounder', batting: 72, bowling: 78 },
            { name: 'Ramandeep Singh', role: 'allrounder', batting: 68, bowling: 65 },
            { name: 'Vaibhav Arora', role: 'bowler', batting: 7, bowling: 73 },
            { name: 'Manish Pandey', role: 'batsman', batting: 72, bowling: 8 },
            { name: 'Rovman Powell', role: 'batsman', batting: 76, bowling: 10 },
            { name: 'Mayank Markande', role: 'bowler', batting: 8, bowling: 72 },
            { name: 'Chetan Sakariya', role: 'bowler', batting: 7, bowling: 72 },
            { name: 'Luvnith Sisodia', role: 'batsman', batting: 68, bowling: 8 }
        ]
    },
    scotland: {
        name: 'Scotland',
        players: [
            // Batsmen
            { name: 'Richie Berrington', role: 'batsman', batting: 78, bowling: 20, captain: true },
            { name: 'George Munsey', role: 'batsman', batting: 76, bowling: 10 },
            { name: 'Kyle Coetzer', role: 'batsman', batting: 74, bowling: 15 },
            { name: 'Calum MacLeod', role: 'batsman', batting: 75, bowling: 10 },
            { name: 'Matthew Cross', role: 'wicketkeeper', batting: 72, bowling: 5 },
            { name: 'Ollie Hairs', role: 'batsman', batting: 70, bowling: 10 },
            { name: 'Dylan Budge', role: 'batsman', batting: 68, bowling: 10 },
            { name: 'Michael Leask', role: 'batsman', batting: 69, bowling: 15 },

            // All-rounders
            { name: 'Mark Watt', role: 'allrounder', batting: 65, bowling: 78 },
            { name: 'Safyaan Sharif', role: 'allrounder', batting: 62, bowling: 75 },
            { name: 'Josh Davey', role: 'allrounder', batting: 64, bowling: 76 },
            { name: 'Alasdair Evans', role: 'allrounder', batting: 60, bowling: 74 },
            { name: 'Gavin Main', role: 'allrounder', batting: 58, bowling: 72 },
            { name: 'Hamza Tahir', role: 'allrounder', batting: 56, bowling: 73 },

            // Bowlers
            { name: 'Bradley Currie', role: 'bowler', batting: 8, bowling: 76 },
            { name: 'Chris Sole', role: 'bowler', batting: 6, bowling: 75 },
            { name: 'Gavin Goudie', role: 'bowler', batting: 5, bowling: 74 },
            { name: 'Adrian Neill', role: 'bowler', batting: 7, bowling: 73 },
            { name: 'Tom Sole', role: 'bowler', batting: 4, bowling: 72 },
            { name: 'Scott Cameron', role: 'bowler', batting: 3, bowling: 71 },
            { name: 'Liam Naylor', role: 'bowler', batting: 5, bowling: 70 },
            { name: 'Jack Jarvis', role: 'bowler', batting: 6, bowling: 69 }
        ]
    },
    ireland: {
        name: 'Ireland',
        players: [
            // Batsmen
            { name: 'Paul Stirling', role: 'batsman', batting: 80, bowling: 25, captain: true },
            { name: 'Andrew Balbirnie', role: 'batsman', batting: 77, bowling: 15 },
            { name: 'Harry Tector', role: 'batsman', batting: 75, bowling: 10 },
            { name: 'Lorcan Tucker', role: 'wicketkeeper', batting: 73, bowling: 5 },
            { name: 'Curtis Campher', role: 'batsman', batting: 71, bowling: 20 },
            { name: 'George Dockrell', role: 'batsman', batting: 69, bowling: 15 },
            { name: 'Neil Rock', role: 'wicketkeeper', batting: 67, bowling: 5 },
            { name: 'Stephen Doheny', role: 'batsman', batting: 68, bowling: 10 },

            // All-rounders
            { name: 'Gareth Delany', role: 'allrounder', batting: 70, bowling: 72 },
            { name: 'Mark Adair', role: 'allrounder', batting: 66, bowling: 75 },
            { name: 'Simi Singh', role: 'allrounder', batting: 64, bowling: 73 },
            { name: 'Andy McBrine', role: 'allrounder', batting: 62, bowling: 74 },
            { name: 'Ben White', role: 'allrounder', batting: 60, bowling: 71 },
            { name: 'Fionn Hand', role: 'allrounder', batting: 58, bowling: 70 },

            // Bowlers
            { name: 'Joshua Little', role: 'bowler', batting: 12, bowling: 78 },
            { name: 'Barry McCarthy', role: 'bowler', batting: 10, bowling: 76 },
            { name: 'Craig Young', role: 'bowler', batting: 8, bowling: 75 },
            { name: 'Conor Olphert', role: 'bowler', batting: 6, bowling: 74 },
            { name: 'Graham Hume', role: 'bowler', batting: 5, bowling: 73 },
            { name: 'Thomas Mayes', role: 'bowler', batting: 4, bowling: 72 },
            { name: 'Matthew Foster', role: 'bowler', batting: 7, bowling: 71 },
            { name: 'Muzamil Sherzad', role: 'bowler', batting: 3, bowling: 70 }
        ]
    },

    // Big Bash League Teams 2025
    brisbane_heat: {
        name: 'Brisbane Heat',
        players: [
            { name: 'Colin Munro', role: 'batsman', batting: 82, bowling: 20, captain: true },
            { name: 'Max Bryant', role: 'batsman', batting: 74, bowling: 15 },
            { name: 'Nathan McSweeney', role: 'batsman', batting: 75, bowling: 10 },
            { name: 'Jimmy Peirson', role: 'wicketkeeper', batting: 74, bowling: 5 },
            { name: 'Sam Billings', role: 'wicketkeeper', batting: 77, bowling: 5 },
            { name: 'Michael Neser', role: 'allrounder', batting: 68, bowling: 78 },
            { name: 'Paul Walter', role: 'allrounder', batting: 70, bowling: 75 },
            { name: 'Xavier Bartlett', role: 'allrounder', batting: 60, bowling: 75 },
            { name: 'Mitchell Swepson', role: 'bowler', batting: 12, bowling: 76 },
            { name: 'Matthew Kuhnemann', role: 'bowler', batting: 8, bowling: 75 },
            { name: 'Spencer Johnson', role: 'allrounder', batting: 65, bowling: 77 },
            { name: 'Jack Wildermuth', role: 'allrounder', batting: 65, bowling: 73 },
            { name: 'Will Prestwidge', role: 'allrounder', batting: 62, bowling: 72 },
            { name: 'Charlie Wakim', role: 'batsman', batting: 71, bowling: 10 },
            { name: 'Josh Brown', role: 'bowler', batting: 10, bowling: 70 },
            { name: 'Liam Guthrie', role: 'bowler', batting: 7, bowling: 70 }
        ]
    },

    sydney_thunder: {
        name: 'Sydney Thunder',
        players: [
            { name: 'Sam Konstas', role: 'batsman', batting: 78, bowling: 10, captain: true },
            { name: 'Oliver Davies', role: 'batsman', batting: 75, bowling: 10 },
            { name: 'Matthew Gilkes', role: 'wicketkeeper', batting: 74, bowling: 5 },
            { name: 'Jason Sangha', role: 'batsman', batting: 72, bowling: 15 },
            { name: 'Daniel Sams', role: 'allrounder', batting: 72, bowling: 76 },
            { name: 'Chris Green', role: 'allrounder', batting: 68, bowling: 75 },
            { name: 'Tanveer Sangha', role: 'allrounder', batting: 58, bowling: 77 },
            { name: 'Nathan McAndrew', role: 'allrounder', batting: 65, bowling: 74 },
            { name: 'Liam Hatcher', role: 'allrounder', batting: 60, bowling: 73 },
            { name: 'Gurinder Sandhu', role: 'bowler', batting: 10, bowling: 74 },
            { name: 'Brendan Doggett', role: 'bowler', batting: 8, bowling: 73 },
            { name: 'Riley Meredith', role: 'bowler', batting: 6, bowling: 76 },
            { name: 'Zaman Khan', role: 'bowler', batting: 4, bowling: 75 },
            { name: 'Toby Gray', role: 'bowler', batting: 5, bowling: 70 },
            { name: 'Will Salzmann', role: 'bowler', batting: 12, bowling: 71 }
        ]
    },

    melbourne_stars: {
        name: 'Melbourne Stars',
        players: [
            { name: 'Joe Clarke', role: 'wicketkeeper', batting: 78, bowling: 5, captain: true },
            { name: 'Beau Webster', role: 'batsman', batting: 76, bowling: 66 },
            { name: 'Hilton Cartwright', role: 'batsman', batting: 73, bowling: 62 },
            { name: 'Campbell Kellaway', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Peter Handscomb', role: 'wicketkeeper', batting: 75, bowling: 5 },
            { name: 'Marcus Stoinis', role: 'allrounder', batting: 80, bowling: 74 },
            { name: 'Imad Wasim', role: 'allrounder', batting: 70, bowling: 76 },
            { name: 'Joel Paris', role: 'allrounder', batting: 65, bowling: 75 },
            { name: 'Mark Steketee', role: 'allrounder', batting: 62, bowling: 74 },
            { name: 'Corey Rocchiccioli', role: 'allrounder', batting: 58, bowling: 72 },
            { name: 'Adam Zampa', role: 'bowler', batting: 15, bowling: 80 },
            { name: 'Haris Rauf', role: 'bowler', batting: 6, bowling: 78 },
            { name: 'Tom Rogers', role: 'bowler', batting: 7, bowling: 72 },
            { name: 'Scott Boland', role: 'bowler', batting: 8, bowling: 76 },
            { name: 'Usama Mir', role: 'bowler', batting: 5, bowling: 74 }
        ]
    },

    perth_scorchers: {
        name: 'Perth Scorchers',
        players: [
            { name: 'Aaron Hardie', role: 'allrounder', batting: 78, bowling: 74, captain: true },
            { name: 'Josh Inglis', role: 'wicketkeeper', batting: 80, bowling: 5 },
            { name: 'Cooper Connolly', role: 'allrounder', batting: 75, bowling: 66 },
            { name: 'Sam Whiteman', role: 'wicketkeeper', batting: 73, bowling: 5 },
            { name: 'Nick Hobson', role: 'batsman', batting: 72, bowling: 15 },
            { name: 'Ashton Agar', role: 'allrounder', batting: 70, bowling: 77 },
            { name: 'Andrew Tye', role: 'allrounder', batting: 62, bowling: 75 },
            { name: 'Jhye Richardson', role: 'allrounder', batting: 60, bowling: 78 },
            { name: 'Jason Behrendorff', role: 'allrounder', batting: 55, bowling: 76 },
            { name: 'Lance Morris', role: 'bowler', batting: 10, bowling: 77 },
            { name: 'Matthew Kelly', role: 'bowler', batting: 7, bowling: 74 },
            { name: 'Ben Manenti', role: 'bowler', batting: 6, bowling: 71 },
            { name: 'Stephen Eskinazi', role: 'batsman', batting: 76, bowling: 10 },
            { name: 'James Bazley', role: 'bowler', batting: 10, bowling: 73 },
            { name: 'Charles Stobo', role: 'bowler', batting: 5, bowling: 70 }
        ]
    },

    sydney_sixers: {
        name: 'Sydney Sixers',
        players: [
            { name: 'Josh Philippe', role: 'wicketkeeper', batting: 80, bowling: 5, captain: true },
            { name: 'Steven Smith', role: 'batsman', batting: 85, bowling: 30 },
            { name: 'James Vince', role: 'batsman', batting: 78, bowling: 15 },
            { name: 'Jordan Silk', role: 'batsman', batting: 74, bowling: 20 },
            { name: 'Kurtis Patterson', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Lachlan Shaw', role: 'batsman', batting: 70, bowling: 10 },
            { name: 'Moises Henriques', role: 'allrounder', batting: 74, bowling: 68 },
            { name: 'Sean Abbott', role: 'allrounder', batting: 70, bowling: 77 },
            { name: 'Ben Dwarshuis', role: 'allrounder', batting: 68, bowling: 75 },
            { name: 'Todd Murphy', role: 'allrounder', batting: 60, bowling: 76 },
            { name: 'Jackson Bird', role: 'bowler', batting: 12, bowling: 75 },
            { name: 'Joel Davies', role: 'bowler', batting: 8, bowling: 73 },
            { name: 'Ben Manenti', role: 'bowler', batting: 7, bowling: 72 },
            { name: 'Mitchell Perry', role: 'bowler', batting: 6, bowling: 70 },
            { name: 'Jack Edwards', role: 'bowler', batting: 10, bowling: 71 }
        ]
    },

    melbourne_renegades: {
        name: 'Melbourne Renegades',
        players: [
            { name: 'Jake Fraser-McGurk', role: 'batsman', batting: 78, bowling: 15, captain: true },
            { name: 'Mackenzie Harvey', role: 'batsman', batting: 73, bowling: 10 },
            { name: 'Sam Harper', role: 'wicketkeeper', batting: 74, bowling: 5 },
            { name: 'Tim Seifert', role: 'wicketkeeper', batting: 74, bowling: 5 },
            { name: 'Jonathan Wells', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Will Sutherland', role: 'allrounder', batting: 70, bowling: 75 },
            { name: 'Tom Rogers', role: 'allrounder', batting: 65, bowling: 73 },
            { name: 'Kane Richardson', role: 'allrounder', batting: 60, bowling: 76 },
            { name: 'Adam Zampa', role: 'allrounder', batting: 62, bowling: 78 },
            { name: 'Spencer Johnson', role: 'bowler', batting: 8, bowling: 77 },
            { name: 'Nathan Lyon', role: 'bowler', batting: 8, bowling: 77 },
            { name: 'Fergus O\'Neill', role: 'bowler', batting: 5, bowling: 73 },
            { name: 'Brendan Doggett', role: 'bowler', batting: 8, bowling: 73 },
            { name: 'Peter Siddle', role: 'bowler', batting: 10, bowling: 74 },
            { name: 'Andrew Tye', role: 'allrounder', batting: 60, bowling: 74 }
        ]
    },

    adelaide_strikers: {
        name: 'Adelaide Strikers',
        players: [
            { name: 'Matthew Short', role: 'allrounder', batting: 78, bowling: 72, captain: true },
            { name: 'Alex Carey', role: 'wicketkeeper', batting: 79, bowling: 5 },
            { name: 'Jake Weatherald', role: 'batsman', batting: 75, bowling: 15 },
            { name: 'Harry Nielsen', role: 'wicketkeeper', batting: 72, bowling: 5 },
            { name: 'Alex Ross', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Thomas Kelly', role: 'batsman', batting: 70, bowling: 10 },
            { name: 'Chris Lynn', role: 'batsman', batting: 79, bowling: 20 },
            { name: 'Jamie Overton', role: 'allrounder', batting: 65, bowling: 74 },
            { name: 'Cameron Boyce', role: 'allrounder', batting: 65, bowling: 75 },
            { name: 'Henry Thornton', role: 'allrounder', batting: 60, bowling: 76 },
            { name: 'Hasan Ali', role: 'bowler', batting: 15, bowling: 78 },
            { name: 'Lloyd Pope', role: 'bowler', batting: 5, bowling: 74 },
            { name: 'Tabraiz Shamsi', role: 'bowler', batting: 8, bowling: 79 },
            { name: 'Luke Wood', role: 'bowler', batting: 12, bowling: 75 },
            { name: 'Jordan Buckingham', role: 'bowler', batting: 6, bowling: 72 }
        ]
    },

    hobart_hurricanes: {
        name: 'Hobart Hurricanes',
        players: [
            { name: 'Matthew Wade', role: 'wicketkeeper', batting: 76, bowling: 5, captain: true },
            { name: 'Ben McDermott', role: 'wicketkeeper', batting: 76, bowling: 5 },
            { name: 'Caleb Jewell', role: 'batsman', batting: 73, bowling: 10 },
            { name: 'Jake Weatherald', role: 'batsman', batting: 74, bowling: 15 },
            { name: 'Macalister Wright', role: 'batsman', batting: 71, bowling: 15 },
            { name: 'Sam Hain', role: 'batsman', batting: 75, bowling: 10 },
            { name: 'Mitchell Owen', role: 'allrounder', batting: 74, bowling: 70 },
            { name: 'Corey Anderson', role: 'allrounder', batting: 72, bowling: 68 },
            { name: 'Nikhil Chaudhary', role: 'allrounder', batting: 65, bowling: 72 },
            { name: 'Rehan Ahmed', role: 'allrounder', batting: 62, bowling: 76 },
            { name: 'Chris Jordan', role: 'allrounder', batting: 68, bowling: 76 },
            { name: 'Nathan Ellis', role: 'bowler', batting: 10, bowling: 76 },
            { name: 'Riley Meredith', role: 'bowler', batting: 6, bowling: 77 },
            { name: 'Iain Carlisle', role: 'bowler', batting: 5, bowling: 73 },
            { name: 'Billy Stanlake', role: 'bowler', batting: 8, bowling: 73 }
        ]
    },
    // Caribbean Premier League (CPL) Teams 2025 - expanded squads (18 players each)
    antigua_barbuda_falcons: {
        name: 'Antigua & Barbuda Falcons',
        // 2026 assembled roster from cricketaddictor.com squad page
        players: [
            // Batters
            { name: 'Rovman Powell', role: 'batsman', batting: 82, bowling: 15, captain: true },
            { name: 'Alex Hales', role: 'batsman', batting: 84, bowling: 10 },
            { name: 'Colin Munro', role: 'batsman', batting: 80, bowling: 12 },
            { name: 'Keacy Carty', role: 'batsman', batting: 76, bowling: 10 },
            { name: 'Bevon Jacobs', role: 'batsman', batting: 72, bowling: 8 },

            // Wicket-Keepers
            { name: 'Jewel Andrew', role: 'wicketkeeper', batting: 74, bowling: 5 },
            { name: 'Amir Jangoo', role: 'wicketkeeper', batting: 70, bowling: 5 },
            { name: 'Andries Gous', role: 'wicketkeeper', batting: 78, bowling: 5 },

            // All-Rounders
            { name: 'Rahkeem Cornwall', role: 'allrounder', batting: 76, bowling: 78 },
            { name: 'Shakib Al Hasan', role: 'allrounder', batting: 78, bowling: 80 },
            { name: 'Fabian Allen', role: 'allrounder', batting: 70, bowling: 74 },
            { name: 'Imad Wasim', role: 'allrounder', batting: 72, bowling: 76 },
            { name: 'Odean Smith', role: 'allrounder', batting: 68, bowling: 75 },
            { name: 'Shamar Springer', role: 'allrounder', batting: 66, bowling: 73 },
            { name: 'Joshua James', role: 'allrounder', batting: 65, bowling: 72 },
            { name: 'Kevin Wickham', role: 'allrounder', batting: 64, bowling: 71 },
            { name: 'Justin Greaves', role: 'allrounder', batting: 62, bowling: 70 },

            // Bowlers
            { name: 'Jayden Seales', role: 'bowler', batting: 14, bowling: 82 },
            { name: 'Allah Ghazanfar', role: 'bowler', batting: 12, bowling: 79 },
            { name: 'Obed McCoy', role: 'bowler', batting: 8, bowling: 76 },
            { name: 'Karima Gore', role: 'bowler', batting: 10, bowling: 74 },
            { name: 'Naveen ul Haq', role: 'bowler', batting: 16, bowling: 81 },
            { name: 'Usama Mir', role: 'bowler', batting: 9, bowling: 75 },
            { name: 'Salman Irshad', role: 'bowler', batting: 11, bowling: 77 }
        ]
    },
    trinbago_knight_riders: {
        name: 'Trinbago Knight Riders',
        // 2026 assembled roster from cricketaddictor.com squad page
        players: [
            // Batters
            { name: 'Alex Hales', role: 'batsman', batting: 84, bowling: 10 },
            { name: 'Colin Munro', role: 'batsman', batting: 80, bowling: 12 },
            { name: 'Keacy Carty', role: 'batsman', batting: 76, bowling: 10 },
            { name: 'Kieron Pollard', role: 'batsman', batting: 82, bowling: 15, captain: true },
            { name: 'Darren Bravo', role: 'batsman', batting: 78, bowling: 8 },

            // Wicket-Keepers
            { name: 'Nicholas Pooran', role: 'wicketkeeper', batting: 86, bowling: 5 },
            { name: 'Joshua Da Silva', role: 'wicketkeeper', batting: 76, bowling: 5 },

            // All-Rounders
            { name: 'Sunil Narine', role: 'allrounder', batting: 74, bowling: 80 },
            { name: 'Akeal Hosein', role: 'allrounder', batting: 68, bowling: 82 },
            { name: 'Terrance Hinds', role: 'allrounder', batting: 66, bowling: 74 },
            { name: 'Andre Russell', role: 'allrounder', batting: 88, bowling: 82 },

            // Bowlers
            { name: 'Mohammad Amir', role: 'bowler', batting: 16, bowling: 85 },
            { name: 'Usman Tariq', role: 'bowler', batting: 10, bowling: 76 },
            { name: 'Nathan Edwards', role: 'bowler', batting: 8, bowling: 78 },
            { name: 'Yannic Cariah', role: 'bowler', batting: 9, bowling: 72 },
            { name: 'Ali Khan', role: 'bowler', batting: 12, bowling: 80 },
            { name: 'McKenny Clarke', role: 'bowler', batting: 7, bowling: 73 },
            { name: 'Saurabh Netravalkar', role: 'bowler', batting: 11, bowling: 77 },
            { name: 'Nyeem Young', role: 'bowler', batting: 6, bowling: 71 }
        ]
    },
    guyana_amazon_warriors: {
        name: 'Guyana Amazon Warriors',
        // 2026 assembled roster from cricketaddictor.com squad page
        players: [
            // Batters
            { name: 'Shimron Hetmyer', role: 'batsman', batting: 80, bowling: 10, captain: true },
            { name: 'Kevlon Anderson', role: 'batsman', batting: 78, bowling: 8 },
            { name: 'Hassan Khan', role: 'batsman', batting: 76, bowling: 10 },
            { name: 'Quentin Sampson', role: 'batsman', batting: 72, bowling: 9 },
            { name: 'Riyad Latiff', role: 'batsman', batting: 70, bowling: 7 },
            { name: 'Glenn Phillips', role: 'batsman', batting: 80, bowling: 12 },

            // Wicket-Keepers
            { name: 'Shai Hope', role: 'wicketkeeper', batting: 84, bowling: 5 },
            { name: 'Ben McDermott', role: 'wicketkeeper', batting: 80, bowling: 5 },
            { name: 'Kemol Savory', role: 'wicketkeeper', batting: 74, bowling: 5 },
            { name: 'Shamarh Brooks', role: 'wicketkeeper', batting: 76, bowling: 5 },
            { name: 'Rahmanullah Gurbaz', role: 'wicketkeeper', batting: 78, bowling: 5 },

            // All-Rounders
            { name: 'Moeen Ali', role: 'allrounder', batting: 76, bowling: 78 },
            { name: 'Iftikhar Ahmed', role: 'allrounder', batting: 72, bowling: 74 },
            { name: 'Romario Shepherd', role: 'allrounder', batting: 68, bowling: 76 },
            { name: 'Dwaine Pretorius', role: 'allrounder', batting: 70, bowling: 75 },
            { name: 'Keemo Paul', role: 'allrounder', batting: 68, bowling: 76 },

            // Bowlers
            { name: 'Gudakesh Motie', role: 'bowler', batting: 10, bowling: 79 },
            { name: 'Shamar Joseph', role: 'bowler', batting: 9, bowling: 78 },
            { name: 'Imran Tahir', role: 'bowler', batting: 12, bowling: 80 },
            { name: 'Jediah Blades', role: 'bowler', batting: 8, bowling: 75 }
        ]
    },
    barbados_royals: {
        name: 'Barbados Royals',

        players: [
            // Wicket-Keepers
            { name: 'Quinton de Kock', role: 'wicketkeeper', batting: 86, bowling: 5 },
            { name: 'Rivaldo Clarke', role: 'wicketkeeper', batting: 76, bowling: 5 },

            // Batters
            { name: 'Rovman Powell', role: 'batsman', batting: 82, bowling: 10, captain: true },
            { name: 'Brandon King', role: 'batsman', batting: 80, bowling: 12 },
            { name: 'Sherfane Rutherford', role: 'batsman', batting: 78, bowling: 8 },
            { name: 'Shaqkere Parris', role: 'batsman', batting: 74, bowling: 15 },
            { name: 'Kofi James', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Rassie van der Dussen', role: 'batsman', batting: 80, bowling: 12 },

            // All-Rounders
            { name: 'Kadeem Alleyne', role: 'allrounder', batting: 72, bowling: 75 },
            { name: 'Daniel Sams', role: 'allrounder', batting: 70, bowling: 78 },
            { name: 'Nyeem Young', role: 'allrounder', batting: 68, bowling: 76 },
            { name: 'Azmatullah Omarzai', role: 'allrounder', batting: 75, bowling: 77 },

            // Bowlers
            { name: 'Eathan Bosch', role: 'bowler', batting: 12, bowling: 80 },
            { name: 'Jomel Warrican', role: 'bowler', batting: 8, bowling: 76 },
            { name: 'Ramon Simmonds', role: 'bowler', batting: 10, bowling: 79 },
            { name: 'Mujeeb Ur Rahman', role: 'bowler', batting: 15, bowling: 77 },
            { name: 'Johann Layne', role: 'bowler', batting: 9, bowling: 74 },
            { name: 'Zishan Motara', role: 'bowler', batting: 8, bowling: 73 },
            { name: 'Arab Gul', role: 'bowler', batting: 10, bowling: 75 },
            { name: 'Chris Green', role: 'bowler', batting: 9, bowling: 74 }
        ]
    },
    saint_lucia_kings: {
        name: 'Saint Lucia Kings',
        // 2026 assembled roster from cricketaddictor.com squad page
        players: [
            // Batters
            { name: 'Sikandar Raza', role: 'batsman', batting: 80, bowling: 10, captain: true },
            { name: 'Ackeem Auguste', role: 'batsman', batting: 76, bowling: 8 },
            { name: 'Aaron Jones', role: 'batsman', batting: 74, bowling: 9 },
            { name: 'Keon Gaston', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Tim David', role: 'batsman', batting: 82, bowling: 8 },
            { name: 'Javelle Glen', role: 'batsman', batting: 68, bowling: 9 },
            { name: 'Johann Jeremiah', role: 'batsman', batting: 70, bowling: 8 },
            { name: 'Sadrack Descartes', role: 'batsman', batting: 66, bowling: 7 },

            // Wicket-Keepers
            { name: 'Johnson Charles', role: 'wicketkeeper', batting: 78, bowling: 5 },
            { name: 'Tim Seifert', role: 'wicketkeeper', batting: 76, bowling: 5 },

            // All-Rounders
            { name: 'Roston Chase', role: 'allrounder', batting: 72, bowling: 68 },
            { name: 'Khary Pierre', role: 'allrounder', batting: 70, bowling: 76 },
            { name: 'David Wiese', role: 'allrounder', batting: 74, bowling: 74 },
            { name: 'Delano Potgieter', role: 'allrounder', batting: 68, bowling: 72 },

            // Bowlers
            { name: 'Alzarri Joseph', role: 'bowler', batting: 12, bowling: 82 },
            { name: 'Tabraiz Shamsi', role: 'bowler', batting: 10, bowling: 80 },
            { name: 'Matthew Forde', role: 'bowler', batting: 8, bowling: 78 },
            { name: 'Micah Mckenzie', role: 'bowler', batting: 9, bowling: 76 },
            { name: 'Oshane Thomas', role: 'bowler', batting: 11, bowling: 77 },
            { name: 'Tymal Mills', role: 'bowler', batting: 13, bowling: 81 }
        ]
    },
    st_kitts_nevis_patriots: {
        name: 'St Kitts & Nevis Patriots',
        // 2026 assembled roster from cricketaddictor.com
        players: [
            // Batters
            { name: 'Evin Lewis', role: 'batsman', batting: 84, bowling: 10, captain: true },
            { name: 'Kyle Mayers', role: 'batsman', batting: 80, bowling: 15 },
            { name: 'Rilee Rossouw', role: 'batsman', batting: 82, bowling: 8 },
            { name: 'Alick Athanaze', role: 'batsman', batting: 78, bowling: 12 },
            { name: 'Jyd Goolie', role: 'batsman', batting: 75, bowling: 10 },
            { name: 'Mikyle Louis', role: 'batsman', batting: 73, bowling: 15 },

            // Wicket-Keepers
            { name: 'Andre Fletcher', role: 'wicketkeeper', batting: 76, bowling: 5 },
            { name: 'Leniko Boucher', role: 'wicketkeeper', batting: 72, bowling: 5 },
            { name: 'Mohammad Rizwan', role: 'wicketkeeper', batting: 83, bowling: 5 },

            // All-Rounders
            { name: 'Jason Holder', role: 'allrounder', batting: 75, bowling: 82 },
            { name: 'Navin Bidaisee', role: 'allrounder', batting: 68, bowling: 76 },
            { name: 'Jeremiah Louis', role: 'allrounder', batting: 70, bowling: 74 },
            { name: 'Mohammad Nawaz', role: 'allrounder', batting: 69, bowling: 78 },
            { name: 'Corbin Bosch', role: 'allrounder', batting: 67, bowling: 75 },

            // Bowlers
            { name: 'Abbas Afridi', role: 'bowler', batting: 12, bowling: 80 },
            { name: 'Naseem Shah', role: 'bowler', batting: 15, bowling: 82 },
            { name: 'Fazalhaq Farooqi', role: 'bowler', batting: 10, bowling: 79 },
            { name: 'Waqar Salamkheil', role: 'bowler', batting: 8, bowling: 77 }
        ]
    },

    // The Hundred Teams 2025
    southern_brave: {
        name: 'Southern Brave',
        players: [
            // Batsmen
            { name: 'James Vince', role: 'batsman', batting: 78, bowling: 15, captain: true },
            { name: 'Devon Conway', role: 'batsman', batting: 80, bowling: 10 },
            { name: 'Finn Allen', role: 'batsman', batting: 76, bowling: 15 },
            { name: 'Leus du Plooy', role: 'batsman', batting: 74, bowling: 20 },
            { name: 'Tim David', role: 'batsman', batting: 77, bowling: 25 },
            { name: 'George Garton', role: 'batsman', batting: 70, bowling: 65 },
            { name: 'Alex Davies', role: 'wicketkeeper', batting: 72, bowling: 5 },

            // All-rounders
            { name: 'Colin de Grandhomme', role: 'allrounder', batting: 75, bowling: 72 },
            { name: 'James Fuller', role: 'allrounder', batting: 68, bowling: 74 },
            { name: 'Chris Jordan', role: 'allrounder', batting: 70, bowling: 75 },
            { name: 'Craig Overton', role: 'allrounder', batting: 65, bowling: 73 },
            { name: 'Danny Briggs', role: 'allrounder', batting: 62, bowling: 76 },

            // Bowlers
            { name: 'Tymal Mills', role: 'bowler', batting: 8, bowling: 77 },
            { name: 'Rehan Ahmed', role: 'bowler', batting: 10, bowling: 75 },
            { name: 'Jofra Archer', role: 'bowler', batting: 12, bowling: 82 },
            { name: 'Jake Lintott', role: 'bowler', batting: 5, bowling: 74 },
            { name: 'Sonny Baker', role: 'bowler', batting: 6, bowling: 72 },
            { name: 'Joe Weatherley', role: 'bowler', batting: 15, bowling: 68 }
        ]
    },

    northern_superchargers: {
        name: 'Northern Superchargers',
        players: [
            // Batsmen
            { name: 'Harry Brook', role: 'batsman', batting: 82, bowling: 15, captain: true },
            { name: 'Ben Stokes', role: 'batsman', batting: 80, bowling: 75 },
            { name: 'Adam Lyth', role: 'batsman', batting: 75, bowling: 10 },
            { name: 'Tom Banton', role: 'wicketkeeper', batting: 76, bowling: 5 },
            { name: 'David Willey', role: 'batsman', batting: 73, bowling: 72 },
            { name: 'Adam Hose', role: 'batsman', batting: 71, bowling: 15 },
            { name: 'Matthew Potts', role: 'batsman', batting: 68, bowling: 70 },

            // All-rounders
            { name: 'Adil Rashid', role: 'allrounder', batting: 65, bowling: 78 },
            { name: 'Brydon Carse', role: 'allrounder', batting: 70, bowling: 74 },
            { name: 'Wayne Parnell', role: 'allrounder', batting: 68, bowling: 73 },
            { name: 'Callum Parkinson', role: 'allrounder', batting: 62, bowling: 75 },
            { name: 'Ben Raine', role: 'allrounder', batting: 64, bowling: 71 },

            // Bowlers
            { name: 'Reece Topley', role: 'bowler', batting: 8, bowling: 76 },
            { name: 'Dwayne Bravo', role: 'bowler', batting: 10, bowling: 75 },
            { name: 'Saqib Mahmood', role: 'bowler', batting: 6, bowling: 74 },
            { name: 'Luke Wood', role: 'bowler', batting: 12, bowling: 72 },
            { name: 'Ollie Robinson', role: 'bowler', batting: 5, bowling: 73 },
            { name: 'Dom Bess', role: 'bowler', batting: 7, bowling: 70 }
        ]
    },

    welsh_fire: {
        name: 'Welsh Fire',
        players: [
            // Batsmen
            { name: 'Jonny Bairstow', role: 'wicketkeeper', batting: 81, bowling: 5, captain: true },
            { name: 'Joe Root', role: 'batsman', batting: 83, bowling: 65 },
            { name: 'Tom Abell', role: 'batsman', batting: 74, bowling: 15 },
            { name: 'Glenn Phillips', role: 'batsman', batting: 77, bowling: 20 },
            { name: 'David Miller', role: 'batsman', batting: 78, bowling: 15 },
            { name: 'Stephen Eskinazi', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Will Smeed', role: 'batsman', batting: 73, bowling: 15 },

            // All-rounders
            { name: 'Shaheen Afridi', role: 'bowler', batting: 35, bowling: 80 },
            { name: 'Haris Rauf', role: 'bowler', batting: 20, bowling: 78 },
            { name: 'Rashid Khan', role: 'allrounder', batting: 68, bowling: 82 },
            { name: 'Roelof van der Merwe', role: 'allrounder', batting: 66, bowling: 74 },
            { name: 'David Payne', role: 'allrounder', batting: 62, bowling: 73 },

            // Bowlers
            { name: 'Jake Ball', role: 'bowler', batting: 8, bowling: 74 },
            { name: 'Luke Fletcher', role: 'bowler', batting: 6, bowling: 73 },
            { name: 'Ben Green', role: 'bowler', batting: 10, bowling: 71 },
            { name: 'Matt Henry', role: 'bowler', batting: 5, bowling: 75 },
            { name: 'Ish Sodhi', role: 'bowler', batting: 7, bowling: 76 },
            { name: 'Stevie Eskinazi', role: 'bowler', batting: 12, bowling: 68 }
        ]
    },

    london_spirit: {
        name: 'London Spirit',
        players: [
            // Batsmen
            { name: 'Zak Crawley', role: 'batsman', batting: 76, bowling: 15, captain: true },
            { name: 'Adam Rossington', role: 'wicketkeeper', batting: 73, bowling: 5 },
            { name: 'Dan Lawrence', role: 'batsman', batting: 75, bowling: 65 },
            { name: 'Ravi Bopara', role: 'batsman', batting: 72, bowling: 68 },
            { name: 'Eoin Morgan', role: 'batsman', batting: 77, bowling: 20 },
            { name: 'Daryl Mitchell', role: 'batsman', batting: 74, bowling: 70 },
            { name: 'Liam Dawson', role: 'batsman', batting: 70, bowling: 75 },

            // All-rounders
            { name: 'Nathan Ellis', role: 'allrounder', batting: 68, bowling: 76 },
            { name: 'Jordan Thompson', role: 'allrounder', batting: 70, bowling: 74 },
            { name: 'Mason Crane', role: 'allrounder', batting: 62, bowling: 75 },
            { name: 'Brad Wheal', role: 'allrounder', batting: 64, bowling: 73 },
            { name: 'Mark Wood', role: 'allrounder', batting: 65, bowling: 77 },

            // Bowlers
            { name: 'Chris Wood', role: 'bowler', batting: 8, bowling: 74 },
            { name: 'Blake Cullen', role: 'bowler', batting: 6, bowling: 72 },
            { name: 'Daniel Bell-Drummond', role: 'bowler', batting: 10, bowling: 70 },
            { name: 'Toby Roland-Jones', role: 'bowler', batting: 5, bowling: 73 },
            { name: 'Max Holden', role: 'bowler', batting: 12, bowling: 68 },
            { name: 'Thilan Walallawita', role: 'bowler', batting: 7, bowling: 71 }
        ]
    },

    oval_invincibles: {
        name: 'Oval Invincibles',
        players: [
            // Batsmen
            { name: 'Sam Billings', role: 'wicketkeeper', batting: 76, bowling: 5, captain: true },
            { name: 'Will Jacks', role: 'batsman', batting: 77, bowling: 65 },
            { name: 'Jason Roy', role: 'batsman', batting: 78, bowling: 15 },
            { name: 'Rilee Rossouw', role: 'batsman', batting: 75, bowling: 20 },
            { name: 'Jordan Cox', role: 'wicketkeeper', batting: 73, bowling: 5 },
            { name: 'Heinrich Klaasen', role: 'batsman', batting: 76, bowling: 15 },
            { name: 'Tom Curran', role: 'batsman', batting: 71, bowling: 72 },

            // All-rounders
            { name: 'Sunil Narine', role: 'allrounder', batting: 70, bowling: 78 },
            { name: 'Sam Curran', role: 'allrounder', batting: 72, bowling: 75 },
            { name: 'Gus Atkinson', role: 'allrounder', batting: 68, bowling: 76 },
            { name: 'Spencer Johnson', role: 'allrounder', batting: 65, bowling: 74 },
            { name: 'Nathan Sowter', role: 'allrounder', batting: 62, bowling: 75 },

            // Bowlers
            { name: 'Adam Zampa', role: 'bowler', batting: 8, bowling: 77 },
            { name: 'Danny Briggs', role: 'bowler', batting: 6, bowling: 75 },
            { name: 'Tom Lawes', role: 'bowler', batting: 10, bowling: 72 },
            { name: 'Rory Burns', role: 'bowler', batting: 5, bowling: 70 },
            { name: 'Jordan Clark', role: 'bowler', batting: 12, bowling: 73 },
            { name: 'Matt Critchley', role: 'bowler', batting: 7, bowling: 71 }
        ]
    },

    manchester_originals: {
        name: 'Manchester Originals',
        players: [
            // Batsmen
            { name: 'Jos Buttler', role: 'wicketkeeper', batting: 84, bowling: 5, captain: true },
            { name: 'Phil Salt', role: 'wicketkeeper', batting: 77, bowling: 5 },
            { name: 'Laurie Evans', role: 'batsman', batting: 75, bowling: 15 },
            { name: 'Wayne Madsen', role: 'batsman', batting: 73, bowling: 20 },
            { name: 'Max Holden', role: 'batsman', batting: 71, bowling: 15 },
            { name: 'Ashton Turner', role: 'batsman', batting: 74, bowling: 65 },
            { name: 'Paul Walter', role: 'batsman', batting: 70, bowling: 68 },

            // All-rounders
            { name: 'Jamie Overton', role: 'allrounder', batting: 72, bowling: 75 },
            { name: 'Tom Hartley', role: 'allrounder', batting: 68, bowling: 76 },
            { name: 'Josh Tongue', role: 'allrounder', batting: 65, bowling: 74 },
            { name: 'Usama Mir', role: 'allrounder', batting: 62, bowling: 75 },
            { name: 'Richard Gleeson', role: 'allrounder', batting: 64, bowling: 73 },

            // Bowlers
            { name: 'Fred Klaassen', role: 'bowler', batting: 8, bowling: 75 },
            { name: 'Mitchell Stanley', role: 'bowler', batting: 6, bowling: 73 },
            { name: 'Calvin Harrison', role: 'bowler', batting: 10, bowling: 71 },
            { name: 'Tom Lammonby', role: 'bowler', batting: 5, bowling: 70 },
            { name: 'Ben Raine', role: 'bowler', batting: 12, bowling: 72 },
            { name: 'Matt Parkinson', role: 'bowler', batting: 7, bowling: 74 }
        ]
    },

    birmingham_phoenix: {
        name: 'Birmingham Phoenix',
        players: [
            // Batsmen
            { name: 'Moeen Ali', role: 'batsman', batting: 76, bowling: 75, captain: true },
            { name: 'Liam Livingstone', role: 'batsman', batting: 78, bowling: 70 },
            { name: 'Ben Duckett', role: 'wicketkeeper', batting: 75, bowling: 5 },
            { name: 'Will Smeed', role: 'batsman', batting: 73, bowling: 15 },
            { name: 'Miles Hammond', role: 'batsman', batting: 71, bowling: 10 },
            { name: 'Dan Mousley', role: 'batsman', batting: 70, bowling: 65 },
            { name: 'Chris Benjamin', role: 'batsman', batting: 69, bowling: 15 },

            // All-rounders
            { name: 'Shadab Khan', role: 'allrounder', batting: 70, bowling: 76 },
            { name: 'Adam Milne', role: 'allrounder', batting: 65, bowling: 77 },
            { name: 'Tom Helm', role: 'allrounder', batting: 68, bowling: 74 },
            { name: 'Henry Brookes', role: 'allrounder', batting: 62, bowling: 73 },
            { name: 'Kane Richardson', role: 'allrounder', batting: 64, bowling: 75 },

            // Bowlers
            { name: 'Benny Howell', role: 'bowler', batting: 8, bowling: 75 },
            { name: 'Jake Lintott', role: 'bowler', batting: 6, bowling: 74 },
            { name: 'Craig Miles', role: 'bowler', batting: 10, bowling: 72 },
            { name: 'Olly Stone', role: 'bowler', batting: 5, bowling: 76 },
            { name: 'Ethan Brookes', role: 'bowler', batting: 12, bowling: 70 },
            { name: 'Alex Davies', role: 'bowler', batting: 7, bowling: 68 }
        ]
    },

    trent_rockets: {
        name: 'Trent Rockets',
        players: [
            // Batsmen
            { name: 'Alex Hales', role: 'batsman', batting: 78, bowling: 15, captain: true },
            { name: 'Dawid Malan', role: 'batsman', batting: 79, bowling: 10 },
            { name: 'Tom Kohler-Cadmore', role: 'wicketkeeper', batting: 74, bowling: 5 },
            { name: 'Colin Munro', role: 'batsman', batting: 77, bowling: 20 },
            { name: 'Sam Hain', role: 'batsman', batting: 73, bowling: 15 },
            { name: 'Lewis Gregory', role: 'batsman', batting: 71, bowling: 70 },

            // All-rounders
            { name: 'Rashid Khan', role: 'allrounder', batting: 68, bowling: 82 },
            { name: 'Samit Patel', role: 'allrounder', batting: 70, bowling: 74 },
            { name: 'Luke Wood', role: 'allrounder', batting: 65, bowling: 75 },
            { name: 'Daniel Sams', role: 'allrounder', batting: 72, bowling: 76 },
            { name: 'Matt Carter', role: 'allrounder', batting: 62, bowling: 73 },

            // Bowlers
            { name: 'Luke Fletcher', role: 'bowler', batting: 8, bowling: 75 },
            { name: 'Steven Mullaney', role: 'bowler', batting: 6, bowling: 73 },
            { name: 'Calvin Harrison', role: 'bowler', batting: 10, bowling: 71 },
            { name: 'Zak Chappell', role: 'bowler', batting: 5, bowling: 72 },
            { name: 'Dane Paterson', role: 'bowler', batting: 12, bowling: 74 },
            { name: 'Tom Moores', role: 'bowler', batting: 7, bowling: 68 }
        ]
    },

    // Pakistan Super League (PSL) Teams 2026
    hyderabad_kingsmen: {
        name: 'Hyderabad Kingsmen',
        players: [
            // Batsmen
            { name: 'Marnus Labuschagne', role: 'batsman', batting: 82, bowling: 25, captain: true },
            { name: 'Sharjeel Khan', role: 'batsman', batting: 78, bowling: 10 },
            { name: 'Syed Saad Ali', role: 'batsman', batting: 70, bowling: 8 },
            { name: 'Hammad Azam', role: 'batsman', batting: 72, bowling: 15 },
            { name: 'Irfan Khan', role: 'batsman', batting: 70, bowling: 10 },
            { name: 'Shayan Jahangir', role: 'batsman', batting: 68, bowling: 8 },
            { name: 'Tayyab Arif', role: 'batsman', batting: 66, bowling: 8 },
            // Wicketkeepers
            { name: 'Kusal Perera', role: 'wicketkeeper', batting: 78, bowling: 5 },
            { name: 'Rizwan Mehmood', role: 'wicketkeeper', batting: 68, bowling: 5 },
            { name: 'Usman Khan', role: 'wicketkeeper', batting: 66, bowling: 5 },
            // Allrounders
            { name: 'Glenn Maxwell', role: 'allrounder', batting: 81, bowling: 70 },
            { name: 'Saim Ayub', role: 'allrounder', batting: 75, bowling: 65 },
            { name: 'Ahmed Hussain', role: 'allrounder', batting: 65, bowling: 68 },
            { name: 'Maaz Sadaqat', role: 'allrounder', batting: 68, bowling: 62 },
            // Bowlers
            { name: 'Maheesh Theekshana', role: 'bowler', batting: 15, bowling: 82 },
            { name: 'Riley Meredith', role: 'bowler', batting: 8, bowling: 77 },
            { name: 'Akif Javed', role: 'bowler', batting: 10, bowling: 76 },
            { name: 'Mohammad Ali', role: 'bowler', batting: 12, bowling: 75 },
            { name: 'Asif Mehmood', role: 'bowler', batting: 8, bowling: 73 },
            { name: 'Hassan Khan', role: 'bowler', batting: 7, bowling: 72 },
            { name: 'Hunain Shah', role: 'bowler', batting: 6, bowling: 71 },
            { name: 'Ottneil Baartman', role: 'bowler', batting: 10, bowling: 78 }
        ]
    },
    islamabad_united: {
        name: 'Islamabad United',
        players: [
            // Batsmen
            { name: 'Sameer Minhas', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Haider Ali', role: 'batsman', batting: 74, bowling: 10 },
            { name: 'Mohammad Faiq', role: 'batsman', batting: 70, bowling: 8 },
            { name: 'Mohsin Riaz', role: 'batsman', batting: 68, bowling: 8 },
            { name: 'Dipendra Singh Airee', role: 'batsman', batting: 72, bowling: 15 },
            { name: 'Max Bryant', role: 'batsman', batting: 72, bowling: 15 },
            // Wicketkeepers
            { name: 'Devon Conway', role: 'wicketkeeper', batting: 81, bowling: 5 },
            { name: 'Andries Gous', role: 'wicketkeeper', batting: 78, bowling: 5 },
            // Allrounders
            { name: 'Shadab Khan', role: 'allrounder', batting: 70, bowling: 80, captain: true },
            { name: 'Imad Wasim', role: 'allrounder', batting: 68, bowling: 78 },
            { name: 'Faheem Ashraf', role: 'allrounder', batting: 65, bowling: 76 },
            { name: 'Mark Chapman', role: 'allrounder', batting: 74, bowling: 65 },
            { name: 'Jordan Cox', role: 'allrounder', batting: 73, bowling: 62 },
            { name: 'Nisar Ahmad', role: 'allrounder', batting: 62, bowling: 68 },
            // Bowlers
            { name: 'Naseem Shah', role: 'bowler', batting: 12, bowling: 84 },
            { name: 'Matthew Potts', role: 'bowler', batting: 10, bowling: 78 },
            { name: 'Tymal Mills', role: 'bowler', batting: 8, bowling: 77 },
            { name: 'Mohammad Hasnain', role: 'bowler', batting: 10, bowling: 78 },
            { name: 'Mehran Mumtaz', role: 'bowler', batting: 8, bowling: 75 },
            { name: 'Richard Gleeson', role: 'bowler', batting: 6, bowling: 74 },
            { name: 'Hamza Sajjad', role: 'bowler', batting: 7, bowling: 72 },
            { name: 'Mohammad Wasim Jr', role: 'bowler', batting: 10, bowling: 80 },
            { name: 'Blessing Muzarabani', role: 'bowler', batting: 8, bowling: 79 }
        ]
    },
    karachi_kings: {
        name: 'Karachi Kings',
        players: [
            // Batsmen
            { name: 'David Warner', role: 'batsman', batting: 85, bowling: 20, captain: true },
            { name: 'Reeza Hendricks', role: 'batsman', batting: 75, bowling: 15 },
            { name: 'Jason Roy', role: 'batsman', batting: 78, bowling: 15 },
            { name: 'Aqib Ilyas', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Haroon Arshad', role: 'batsman', batting: 68, bowling: 8 },
            { name: 'Muhammad Waseem', role: 'batsman', batting: 70, bowling: 10 },
            // Wicketkeepers
            { name: 'Azam Khan', role: 'wicketkeeper', batting: 74, bowling: 5 },
            { name: 'Saad Baig', role: 'wicketkeeper', batting: 70, bowling: 5 },
            { name: 'Johnson Charles', role: 'wicketkeeper', batting: 74, bowling: 5 },
            // Allrounders
            { name: 'Moeen Ali', role: 'allrounder', batting: 73, bowling: 78 },
            { name: 'Salman Agha', role: 'allrounder', batting: 70, bowling: 72 },
            { name: 'Khushdil Shah', role: 'allrounder', batting: 68, bowling: 65 },
            { name: 'Shahid Aziz', role: 'allrounder', batting: 64, bowling: 68 },
            // Bowlers
            { name: 'Adam Zampa', role: 'bowler', batting: 15, bowling: 82 },
            { name: 'Abbas Afridi', role: 'bowler', batting: 12, bowling: 80 },
            { name: 'Hasan Ali', role: 'bowler', batting: 18, bowling: 82 },
            { name: 'Ihsanullah', role: 'bowler', batting: 8, bowling: 78 },
            { name: 'Mir Hamza', role: 'bowler', batting: 10, bowling: 76 },
            { name: 'Mohammad Hamza', role: 'bowler', batting: 7, bowling: 73 },
            { name: 'Rizwanullah', role: 'bowler', batting: 6, bowling: 72 },
            { name: 'Khuzaima Tanveer', role: 'bowler', batting: 7, bowling: 71 }
        ]
    },
    lahore_qalandars: {
        name: 'Lahore Qalandars',
        players: [
            // Batsmen
            { name: 'Fakhar Zaman', role: 'batsman', batting: 81, bowling: 15 },
            { name: 'Abdullah Shafique', role: 'batsman', batting: 78, bowling: 10 },
            { name: 'Tayyab Tahir', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Asif Ali', role: 'batsman', batting: 74, bowling: 10 },
            { name: 'Mohammad Farooq', role: 'batsman', batting: 70, bowling: 8 },
            { name: 'Mohammad Naeem', role: 'batsman', batting: 66, bowling: 8 },
            // Wicketkeepers
            { name: 'Haseebullah Khan', role: 'wicketkeeper', batting: 72, bowling: 5 },
            { name: 'Rubin Hermann', role: 'wicketkeeper', batting: 68, bowling: 5 },
            // Allrounders
            { name: 'Sikandar Raza', role: 'allrounder', batting: 76, bowling: 72 },
            { name: 'Wanindu Hasaranga', role: 'allrounder', batting: 68, bowling: 80 },
            { name: 'Daniel Sams', role: 'allrounder', batting: 72, bowling: 76 },
            { name: 'Ryan Burl', role: 'allrounder', batting: 70, bowling: 68 },
            { name: 'Hussain Talat', role: 'allrounder', batting: 68, bowling: 62 },
            { name: 'Dasun Shanaka', role: 'allrounder', batting: 70, bowling: 75 },
            // Bowlers
            { name: 'Shaheen Afridi', role: 'bowler', batting: 20, bowling: 90, captain: true },
            { name: 'Haris Rauf', role: 'bowler', batting: 15, bowling: 86 },
            { name: 'Mustafizur Rahman', role: 'bowler', batting: 10, bowling: 80 },
            { name: 'Usama Mir', role: 'bowler', batting: 5, bowling: 77 },
            { name: 'Dunith Wellalage', role: 'bowler', batting: 12, bowling: 76 },
            { name: 'Ollie Robinson', role: 'bowler', batting: 5, bowling: 73 },
            { name: 'Maaz Khan', role: 'bowler', batting: 8, bowling: 74 },
            { name: 'Shahab Khan', role: 'bowler', batting: 7, bowling: 72 },
            { name: 'Ubaid Shah', role: 'bowler', batting: 6, bowling: 71 },
            { name: 'Gudakesh Motie', role: 'bowler', batting: 10, bowling: 77 }
        ]
    },
    multan_sultans: {
        name: 'Multan Sultans',
        players: [
            // Batsmen
            { name: 'Steve Smith', role: 'batsman', batting: 86, bowling: 30 },
            { name: 'Shan Masood', role: 'batsman', batting: 76, bowling: 10 },
            { name: 'Sahibzada Farhan', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Ashton Turner', role: 'batsman', batting: 74, bowling: 65, captain: true },
            { name: 'Delano Potgieter', role: 'batsman', batting: 70, bowling: 15 },
            { name: 'Awais Zafar', role: 'batsman', batting: 66, bowling: 8 },
            { name: 'Jahanzaib Sultan', role: 'batsman', batting: 68, bowling: 8 },
            // Wicketkeepers
            { name: 'Josh Philippe', role: 'wicketkeeper', batting: 78, bowling: 5 },
            { name: 'Lachlan Shaw', role: 'wicketkeeper', batting: 68, bowling: 5 },
            // Allrounders
            { name: 'Mohammad Nawaz', role: 'allrounder', batting: 69, bowling: 78 },
            { name: 'Chris Green', role: 'allrounder', batting: 68, bowling: 74 },
            { name: 'Lahiru Madushanka', role: 'allrounder', batting: 65, bowling: 72 },
            { name: 'Mohammad Huraira', role: 'allrounder', batting: 72, bowling: 62 },
            { name: 'Atizaz Habib Khan', role: 'allrounder', batting: 64, bowling: 66 },
            { name: 'Mohammad Imran', role: 'allrounder', batting: 62, bowling: 68 },
            { name: 'Muhammad Shahzad', role: 'allrounder', batting: 66, bowling: 60 },
            { name: 'Saad Masood', role: 'allrounder', batting: 64, bowling: 62 },
            // Bowlers
            { name: 'Tabraiz Shamsi', role: 'bowler', batting: 12, bowling: 82 },
            { name: 'Mohammad Wasim Jr', role: 'bowler', batting: 10, bowling: 80 },
            { name: 'Peter Siddle', role: 'bowler', batting: 12, bowling: 76 },
            { name: 'Faisal Akram', role: 'bowler', batting: 8, bowling: 75 },
            { name: 'Momin Qamar', role: 'bowler', batting: 7, bowling: 73 },
            { name: 'Muhammad Ismail', role: 'bowler', batting: 6, bowling: 72 },
            { name: 'Shehzad Gul', role: 'bowler', batting: 8, bowling: 71 },
            { name: 'Ahmed Daniyal', role: 'bowler', batting: 10, bowling: 74 }
        ]
    },
    peshawar_zalmi: {
        name: 'Peshawar Zalmi',
        players: [
            // Batsmen
            { name: 'Babar Azam', role: 'batsman', batting: 83, bowling: 20, captain: true },
            { name: 'Fakhar Zaman', role: 'batsman', batting: 81, bowling: 15 },
            { name: 'Iftikhar Ahmed', role: 'batsman', batting: 74, bowling: 25 },
            { name: 'Abdul Samad', role: 'batsman', batting: 72, bowling: 15 },
            { name: 'Farhan Yousaf', role: 'batsman', batting: 70, bowling: 10 },
            { name: 'Mohammad Basit Ali', role: 'batsman', batting: 68, bowling: 8 },
            { name: 'Tanzid Hasan', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Mirza Baig', role: 'batsman', batting: 66, bowling: 8 },
            { name: 'James Vince', role: 'batsman', batting: 78, bowling: 15 },
            // Wicketkeepers
            { name: 'Kusal Mendis', role: 'wicketkeeper', batting: 82, bowling: 5 },
            { name: 'Mohammad Haris', role: 'wicketkeeper', batting: 74, bowling: 5 },
            // Allrounders
            { name: 'Aamer Jamal', role: 'allrounder', batting: 68, bowling: 76 },
            { name: 'Aaron Hardie', role: 'allrounder', batting: 72, bowling: 72 },
            { name: 'Michael Bracewell', role: 'allrounder', batting: 66, bowling: 73 },
            { name: 'Brian Bennett', role: 'allrounder', batting: 70, bowling: 65 },
            { name: 'Khalid Usman', role: 'allrounder', batting: 62, bowling: 70 },
            // Bowlers
            { name: 'Shahnawaz Dahani', role: 'bowler', batting: 10, bowling: 80 },
            { name: 'Nahid Rana', role: 'bowler', batting: 8, bowling: 78 },
            { name: 'Shoriful Islam', role: 'bowler', batting: 8, bowling: 78 },
            { name: 'Khurram Shahzad', role: 'bowler', batting: 10, bowling: 76 },
            { name: 'Kashif Ali', role: 'bowler', batting: 7, bowling: 74 },
            { name: 'Ali Raza', role: 'bowler', batting: 8, bowling: 73 },
            { name: 'Abdul Subhan', role: 'bowler', batting: 6, bowling: 72 },
            { name: 'Mohammad Basit', role: 'bowler', batting: 7, bowling: 71 }
        ]
    },
    quetta_gladiators: {
        name: 'Quetta Gladiators',
        players: [
            // Batsmen
            { name: 'Saud Shakeel', role: 'batsman', batting: 80, bowling: 15, captain: true },
            { name: 'Rilee Rossouw', role: 'batsman', batting: 82, bowling: 8 },
            { name: 'Ahsan Ali', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Shamyl Hussain', role: 'batsman', batting: 70, bowling: 10 },
            { name: 'Hasan Nawaz', role: 'batsman', batting: 68, bowling: 8 },
            { name: 'Bevon Jacobs', role: 'batsman', batting: 70, bowling: 8 },
            { name: 'Jahanzaib Sultan', role: 'batsman', batting: 68, bowling: 8 },
            // Wicketkeepers
            { name: 'Ben McDermott', role: 'wicketkeeper', batting: 75, bowling: 5 },
            { name: 'Sam Harper', role: 'wicketkeeper', batting: 72, bowling: 5 },
            { name: 'Bismillah Khan', role: 'wicketkeeper', batting: 70, bowling: 5 },
            { name: 'Khawaja Nafay', role: 'wicketkeeper', batting: 68, bowling: 5 },
            // Allrounders
            { name: 'Tom Curran', role: 'allrounder', batting: 71, bowling: 72 },
            { name: 'Adil Rashid', role: 'allrounder', batting: 65, bowling: 83 },
            { name: 'Akeal Hosein', role: 'allrounder', batting: 68, bowling: 79 },
            { name: 'Fawad Ahmed', role: 'allrounder', batting: 62, bowling: 72 },
            { name: 'Brett Hampton', role: 'allrounder', batting: 64, bowling: 68 },
            // Bowlers
            { name: 'Alzarri Joseph', role: 'bowler', batting: 20, bowling: 85 },
            { name: 'Usman Tariq', role: 'bowler', batting: 10, bowling: 76 },
            { name: 'Khalil Ahmed', role: 'bowler', batting: 8, bowling: 75 },
            { name: 'Khan Zaib', role: 'bowler', batting: 7, bowling: 73 },
            { name: 'Saqib Khan', role: 'bowler', batting: 6, bowling: 72 },
            { name: 'Wasim Akram', role: 'bowler', batting: 8, bowling: 71 },
            { name: 'Arafat Minhas', role: 'bowler', batting: 10, bowling: 74 },
            { name: 'Faisal Akram', role: 'bowler', batting: 8, bowling: 75 }
        ]
    },
    rawalpindi_pindiz: {
        name: 'Rawalpindi Pindiz',
        players: [
            // Batsmen
            { name: 'Usman Khawaja', role: 'batsman', batting: 81, bowling: 15 },
            { name: 'Abdullah Fazal', role: 'batsman', batting: 70, bowling: 10 },
            { name: 'Shahzaib Khan', role: 'batsman', batting: 72, bowling: 10 },
            { name: 'Yasir Khan', role: 'batsman', batting: 70, bowling: 8 },
            { name: 'Laurie Evans', role: 'batsman', batting: 75, bowling: 20 },
            { name: 'Jake Fraser-McGurk', role: 'batsman', batting: 75, bowling: 15 },
            // Wicketkeepers
            { name: 'Mohammad Rizwan', role: 'wicketkeeper', batting: 83, bowling: 5, captain: true },
            { name: 'Sam Billings', role: 'wicketkeeper', batting: 76, bowling: 5 },
            // Allrounders
            { name: 'Daryl Mitchell', role: 'allrounder', batting: 77, bowling: 70 },
            { name: 'Kamran Ghulam', role: 'allrounder', batting: 74, bowling: 65 },
            { name: 'Amad Butt', role: 'allrounder', batting: 66, bowling: 72 },
            { name: 'Asif Afridi', role: 'allrounder', batting: 62, bowling: 74 },
            { name: 'Dian Forrester', role: 'allrounder', batting: 68, bowling: 68 },
            { name: 'Cole McConchie', role: 'allrounder', batting: 65, bowling: 70 },
            // Bowlers
            { name: 'Naseem Shah', role: 'bowler', batting: 12, bowling: 84 },
            { name: 'Mohammad Amir', role: 'bowler', batting: 16, bowling: 85 },
            { name: 'Ben Sears', role: 'bowler', batting: 10, bowling: 78 },
            { name: 'Fawad Ali', role: 'bowler', batting: 8, bowling: 74 },
            { name: 'Jalat Khan', role: 'bowler', batting: 7, bowling: 73 },
            { name: 'Mohammad Amir Khan', role: 'bowler', batting: 8, bowling: 72 },
            { name: 'Razaullah', role: 'bowler', batting: 6, bowling: 71 },
            { name: 'Zaman Khan', role: 'bowler', batting: 7, bowling: 79 }
        ]
    }
};

// Venue data with home grounds and neutral venues
const venues = {
    india: {
        name: 'India',
        homeGrounds: [
            { name: 'Arun Jaitley Stadium', city: 'Delhi' },
            { name: 'Wankhede Stadium', city: 'Mumbai' },
            { name: 'M. A. Chidambaram Stadium', city: 'Chennai' },
            { name: 'Eden Gardens', city: 'Kolkata' },
            { name: 'Narendra Modi Stadium', city: 'Ahmedabad' },
            { name: 'Rajiv Gandhi International Cricket Stadium', city: 'Hyderabad' },
            { name: 'Vidarbha Cricket Association Stadium', city: 'Nagpur' },
            { name: 'Punjab Cricket Association Stadium', city: 'Mohali' },
            { name: 'Holkar Cricket Stadium', city: 'Indore' },
            { name: 'JSCA International Stadium', city: 'Ranchi' },
            { name: 'Green Park', city: 'Kanpur' },
            { name: 'Sawai Mansingh Stadium', city: 'Jaipur' },
            { name: 'Dr. Y.S. Rajasekhara Reddy ACA-VDCA Cricket Stadium', city: 'Visakhapatnam' },
            { name: 'Maharashtra Cricket Association Stadium', city: 'Pune' },
            { name: 'Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium', city: 'Lucknow' },
            { name: 'Saurashtra Cricket Association Stadium', city: 'Rajkot' },
            { name: 'Himachal Pradesh Cricket Association Ground', city: 'Dharamshala' },
            { name: 'Brijendra Singh Ground', city: 'Patiala' },
            { name: 'M. Chinnaswamy Stadium', city: 'Bengaluru' },
            { name: 'DY Patil Stadium', city: 'Navi Mumbai' }
        ]
    },
    australia: {
        name: 'Australia',
        homeGrounds: [
            { name: 'Melbourne Cricket Ground', city: 'Melbourne' },
            { name: 'Sydney Cricket Ground', city: 'Sydney' },
            { name: 'WACA Ground', city: 'Perth' },
            { name: 'Gabba', city: 'Brisbane' },
            { name: 'Adelaide Oval', city: 'Adelaide' },
            { name: 'Bellerive Oval', city: 'Hobart' },
            { name: 'Manuka Oval', city: 'Canberra' },
            { name: 'Bankstown Oval', city: 'Sydney' },
            { name: 'Junction Oval', city: 'Melbourne' },
            { name: 'Carrara Oval', city: 'Gold Coast' }
        ]
    },
    england: {
        name: 'England',
        homeGrounds: [
            { name: 'Lords', city: 'London' },
            { name: 'Oval', city: 'London' },
            { name: 'Old Trafford', city: 'Manchester' },
            { name: 'Headingley', city: 'Leeds' },
            { name: 'Edgbaston', city: 'Birmingham' },
            { name: 'Trent Bridge', city: 'Nottingham' },
            { name: 'County Ground', city: 'Cheltenham' },
            { name: 'Rose Bowl', city: 'Southampton' },
            { name: 'Arundel Castle Ground', city: 'Arundel' },
            { name: 'Grace Road', city: 'Leicester' },
            { name: 'Nevill Ground', city: 'Tunbridge Wells' },
            { name: 'The County Ground', city: 'Bristol' },
            { name: 'Sophia Gardens', city: 'Cardiff' },
            { name: 'Gover Lane', city: 'Guildford' }
        ]
    },
    southafrica: {
        name: 'South Africa',
        homeGrounds: [
            { name: 'Newlands', city: 'Cape Town' },
            { name: 'Wanderers Stadium', city: 'Johannesburg' },
            { name: 'Supersport Park', city: 'Centurion' },
            { name: 'Sahara Stadium Kingsmead', city: 'Durban' },
            { name: 'St George\'s Park', city: 'Port Elizabeth' },
            { name: 'Axxess DSL Stadium', city: 'Potchefstroom' },
            { name: 'Willowmoore Park', city: 'Benoni' },
            { name: 'Boland Park', city: 'Paarl' },
            { name: 'Border Ground', city: 'East London' },
            { name: 'University of Pretoria Ground', city: 'Pretoria' },
            { name: 'Springbok Park', city: 'Bloemfontein' }
        ]
    },
    newzealand: {
        name: 'New Zealand',
        homeGrounds: [
            { name: 'Basin Reserve', city: 'Wellington' },
            { name: 'Eden Park', city: 'Auckland' },
            { name: 'Seddon Park', city: 'Hamilton' },
            { name: 'Lancaster Park', city: 'Christchurch' },
            { name: 'University Oval', city: 'Dunedin' },
            { name: 'Saxton Oval', city: 'Nelson' },
            { name: 'Cobham Oval', city: 'Whangarei' },
            { name: 'Taranaki Stadium', city: 'New Plymouth' },
            { name: 'QE II Park', city: 'Invercargill' },
            { name: 'McLean Park', city: 'Napier' },
            { name: 'Pukekura Park', city: 'New Plymouth' }
        ]
    },
    pakistan: {
        name: 'Pakistan',
        homeGrounds: [
            { name: 'Gaddafi Stadium', city: 'Lahore' },
            { name: 'National Stadium', city: 'Karachi' },
            { name: 'Arbab Niaz Stadium', city: 'Peshawar' },
            { name: 'Multan Cricket Stadium', city: 'Multan' },
            { name: 'Rawalpindi Cricket Stadium', city: 'Rawalpindi' },
            { name: 'Iqbal Stadium', city: 'Faisalabad' },
            { name: 'Jinnah Stadium', city: 'Sialkot' },
            { name: 'UBL Sports Complex', city: 'Karachi' },
            { name: 'Abbottabad Cricket Ground', city: 'Abbottabad' },
            { name: 'Hyderabad Cricket Association Ground', city: 'Hyderabad' },
            { name: 'Sahiwal Cricket Stadium', city: 'Sahiwal' }
        ]
    },
    srilanka: {
        name: 'Sri Lanka',
        homeGrounds: [
            { name: 'R. Premadasa Stadium', city: 'Colombo' },
            { name: 'Pallekele International Cricket Stadium', city: 'Kandy' },
            { name: 'Asgiriya Stadium', city: 'Kandy' },
            { name: 'Galle International Stadium', city: 'Galle' },
            { name: 'Sinhalese Sports Club Ground', city: 'Colombo' },
            { name: 'Nuwara Eliya Cricket Club', city: 'Nuwara Eliya' },
            { name: 'Matara Cricket Club Ground', city: 'Matara' },
            { name: 'Colombo Cricket Club Ground', city: 'Colombo' },
            { name: 'Maitland Place', city: 'Colombo' }
        ]
    },
    bangladesh: {
        name: 'Bangladesh',
        homeGrounds: [
            { name: 'Sher-e-Bangla National Stadium', city: 'Dhaka' },
            { name: 'Chittagong Stadium', city: 'Chittagong' },
            { name: 'Sylhet International Cricket Stadium', city: 'Sylhet' }
        ]
    },
    westindies: {
        name: 'West Indies',
        homeGrounds: [
            { name: 'Sabina Park', city: 'Kingston, Jamaica' },
            { name: 'Queen\'s Park Oval', city: 'Port of Spain, Trinidad' },
            { name: 'Grenada National Stadium', city: 'St. George\'s, Grenada' },
            { name: 'Vivian Richards Stadium', city: 'North Sound, Antigua' },
            { name: 'Kensington Oval', city: 'Bridgetown, Barbados' },
            { name: 'Daren Sammy National Cricket Stadium', city: 'Gros Islet, St. Lucia' },
            { name: 'Providence Stadium', city: 'Guyana' },
            { name: 'Warner Park', city: 'Basseterre, St. Kitts' },
            { name: 'Arnos Vale Ground', city: 'St. Vincent' }
        ]
    },
    afghanistan: {
        name: 'Afghanistan',
        homeGrounds: [
            { name: 'Afghanistan Cricket Board Stadium', city: 'Kabul' },

        ]
    },
    scotland: {
        name: 'Scotland',
        homeGrounds: [
            { name: 'The Grange', city: 'Edinburgh' },
            { name: 'Caledonia Park', city: 'Glasgow' }
        ]
    },
    ireland: {
        name: 'Ireland',
        homeGrounds: [
            { name: 'Malahide', city: 'Dublin' },
            { name: 'Clontibret', city: 'Monaghan' }
        ]
    },
    uae: {
        name: 'United Arab Emirates',
        homeGrounds: [
            { name: 'Sharjah Cricket Stadium', city: 'Sharjah' },
            { name: 'Dubai International Cricket Stadium', city: 'Dubai' },
            { name: 'Abu Dhabi Cricket Club Ground', city: 'Abu Dhabi' }
        ]
    },
    zimbabwe: {
        name: 'Zimbabwe',
        homeGrounds: [
            { name: 'Harare Sports Club', city: 'Harare' },
            { name: 'Queens Sports Club', city: 'Bulawayo' }
        ]
    },
    namibia: {
        name: 'Namibia',
        homeGrounds: [
            { name: 'Wanderers Cricket Club', city: 'Windhoek' }
        ]
    },
    oman: {
        name: 'Oman',
        homeGrounds: [
            { name: 'Al Amerat Cricket Ground', city: 'Amerat' },
            { name: 'Oman Cricket Academy Ground', city: 'Muscat' }
        ]
    }
};


const allStadiums = [];
for (const teamKey in venues) {
    const team = venues[teamKey];
    team.homeGrounds.forEach(ground => {
        allStadiums.push({
            name: ground.name,
            city: ground.city,
            country: team.name,
            isHome: false
        });
    });
}

// Global venue selection
let team1Venue = null;

// Match type configurations
const matchConfigs = {
    t20: { overs: 20, maxWickets: 10 },
    odi: { overs: 50, maxWickets: 10 },
    test: { overs: 90, maxWickets: 10, innings: 2 }
};

// Dynamic UI Theme colors for full member nations
const nationColors = {
    india: { bg: '#1e3a8a', accent1: '#f97316', accent2: '#fb923c' },        // Blue / Orange
    australia: { bg: '#064e3b', accent1: '#facc15', accent2: '#fde047' },    // Green / Gold
    england: { bg: '#1e3a8a', accent1: '#dc2626', accent2: '#ef4444' },      // Blue / Red
    southafrica: { bg: '#14532d', accent1: '#fde047', accent2: '#fef08a' },  // Green / Yellow
    newzealand: { bg: '#000000', accent1: '#e5e7eb', accent2: '#d1d5db' },   // Black / Silver
    pakistan: { bg: '#064e3b', accent1: '#86efac', accent2: '#bbf7d0' },     // Green / Light Green
    srilanka: { bg: '#1e3a8a', accent1: '#facc15', accent2: '#fde047' },     // Blue / Yellow
    bangladesh: { bg: '#166534', accent1: '#ef4444', accent2: '#f87171' },   // Green / Red
    westindies: { bg: '#701a75', accent1: '#facc15', accent2: '#fde047' },   // Maroon / Gold
    afghanistan: { bg: '#1e3a8a', accent1: '#dc2626', accent2: '#ef4444' },  // Blue / Red
    ireland: { bg: '#166534', accent1: '#ffffff', accent2: '#e2e8f0' },      // Green / White
    scotland: { bg: '#1e3a8a', accent1: '#e5e7eb', accent2: '#d1d5db' },    // Blue / Silver

    // IPL Teams
    rcb: { bg: '#7f1d1d', accent1: '#fbbf24', accent2: '#f59e0b' },          // Dark Red / Gold
    csk: { bg: '#1e3a8a', accent1: '#facc15', accent2: '#fde047' },          // Navy / Yellow
    mi: { bg: '#1e3a8a', accent1: '#60a5fa', accent2: '#93c5fd' },           // Dark Blue / Sky Blue
    gt: { bg: '#0c4a6e', accent1: '#2dd4bf', accent2: '#5eead4' },           // Dark Teal / Aqua
    lsg: { bg: '#164e63', accent1: '#22d3ee', accent2: '#67e8f9' },          // Teal / Cyan
    dc: { bg: '#1e3a8a', accent1: '#ef4444', accent2: '#f87171' },           // Blue / Red
    srh: { bg: '#1c1917', accent1: '#ea580c', accent2: '#fb923c' },          // Black / Orange
    pbks: { bg: '#7f1d1d', accent1: '#e5e7eb', accent2: '#d1d5db' },         // Red / Silver
    rr: { bg: '#f50e6bff', accent1: '#76a0d3ff', accent2: '#93c5fd' },           // Pink / Blue
    kkr: { bg: '#3b0764', accent1: '#facc15', accent2: '#fde047' },          // Purple / Gold

    // BBL Teams
    brisbane_heat: { bg: '#164e63', accent1: '#22d3ee', accent2: '#67e8f9' },
    sydney_thunder: { bg: '#064e3b', accent1: '#86efac', accent2: '#bbf7d0' },
    melbourne_stars: { bg: '#064e3b', accent1: '#facc15', accent2: '#fde047' },
    perth_scorchers: { bg: '#7c2d12', accent1: '#fb923c', accent2: '#fdba74' },
    sydney_sixers: { bg: '#701a75', accent1: '#e879f9', accent2: '#f0abfc' },
    melbourne_renegades: { bg: '#7f1d1d', accent1: '#fca5a5', accent2: '#fecaca' },
    adelaide_strikers: { bg: '#1e3a8a', accent1: '#60a5fa', accent2: '#93c5fd' },
    hobart_hurricanes: { bg: '#3b0764', accent1: '#c084fc', accent2: '#d8b4fe' },

    // The Hundred Teams
    southern_brave: { bg: '#1e3a8a', accent1: '#22d3ee', accent2: '#67e8f9' },
    northern_superchargers: { bg: '#7c2d12', accent1: '#fbbf24', accent2: '#fde047' },
    welsh_fire: { bg: '#7f1d1d', accent1: '#ef4444', accent2: '#f87171' },
    london_spirit: { bg: '#164e63', accent1: '#2dd4bf', accent2: '#5eead4' },
    oval_invincibles: { bg: '#3b0764', accent1: '#facc15', accent2: '#fde047' },
    manchester_originals: { bg: '#1c1917', accent1: '#fb923c', accent2: '#fdba74' },
    birmingham_phoenix: { bg: '#7f1d1d', accent1: '#f97316', accent2: '#fb923c' },
    trent_rockets: { bg: '#064e3b', accent1: '#86efac', accent2: '#bbf7d0' },

    // CPL Teams
    antigua_barbuda_falcons: { bg: '#1e3a8a', accent1: '#facc15', accent2: '#fde047' },
    trinbago_knight_riders: { bg: '#3b0764', accent1: '#facc15', accent2: '#fde047' },
    guyana_amazon_warriors: { bg: '#064e3b', accent1: '#86efac', accent2: '#bbf7d0' },
    barbados_royals: { bg: '#1e3a8a', accent1: '#facc15', accent2: '#fde047' },
    saint_lucia_kings: { bg: '#164e63', accent1: '#22d3ee', accent2: '#67e8f9' },
    st_kitts_nevis_patriots: { bg: '#7f1d1d', accent1: '#fbbf24', accent2: '#fde047' },

    // PSL Teams
    hyderabad_kingsmen: { bg: '#1e3a8a', accent1: '#fbbf24', accent2: '#fde047' }, // Blue/Gold
    islamabad_united: { bg: '#7f1d1d', accent1: '#fb923c', accent2: '#fdba74' },   // Red/Orange
    karachi_kings: { bg: '#1e3a8a', accent1: '#f87171', accent2: '#fca5a5' },      // Blue/Red
    lahore_qalandars: { bg: '#064e3b', accent1: '#ef4444', accent2: '#f87171' },   // Green/Red
    multan_sultans: { bg: '#064e3b', accent1: '#60a5fa', accent2: '#93c5fd' },     // Green/Blue
    peshawar_zalmi: { bg: '#f59e0b', accent1: '#1c1917', accent2: '#292524' },     // Yellow/Black
    quetta_gladiators: { bg: '#3b0764', accent1: '#fbbf24', accent2: '#fde047' },  // Purple/Gold
    rawalpindi_pindiz: { bg: '#7f1d1d', accent1: '#60a5fa', accent2: '#93c5fd' }   // Red/Blue
};

function updateDynamicTheme() {
    const t1Select = document.getElementById('team1');
    const t2Select = document.getElementById('team2');

    // Safety check - might not be fully initialized or in a different tab
    if (!t1Select || !t2Select) return;

    const team1Key = t1Select.value;
    const team2Key = t2Select.value;

    const root = document.documentElement;
    const hasThemeColors = (team1Key && nationColors[team1Key]) || (team2Key && nationColors[team2Key]);

    if (hasThemeColors) {
        document.body.classList.add('dynamic-theme-active');

        let c1 = nationColors[team1Key] || nationColors[team2Key]; // Fallback if one is missing
        let c2 = nationColors[team2Key] || nationColors[team1Key];

        root.style.setProperty('--dynamic-bg', `linear-gradient(135deg, ${c1.bg} 0%, ${c2.bg} 100%)`);

        // Setup accents based on teams
        root.style.setProperty('--dynamic-accent-1', c1.accent1);
        root.style.setProperty('--dynamic-accent-2', c2.accent1);

    } else {
        document.body.classList.remove('dynamic-theme-active');
    }
}

// Load team data and create lineups
function loadTeam(teamNum) {
    const teamSelect = document.getElementById(`team${teamNum}`);
    const teamKey = teamSelect.value;

    if (!teamKey) return;

    const team = teams[teamKey];

    // Normalize player ratings - ensure players keep their best ratings across teams
    const normalizedPlayers = team.players.map(player => {
        // Find the best ratings for this player across all teams
        let bestBatting = player.batting;
        let bestBowling = player.bowling;

        Object.keys(teams).forEach(otherTeamKey => {
            const otherTeam = teams[otherTeamKey];
            const otherPlayer = otherTeam.players.find(p => p.name === player.name);
            if (otherPlayer) {
                bestBatting = Math.max(bestBatting, otherPlayer.batting);
                bestBowling = Math.max(bestBowling, otherPlayer.bowling);
            }
        });

        return {
            ...player,
            batting: bestBatting,
            bowling: bestBowling
        };
    });

    const normalizedTeam = {
        ...team,
        players: normalizedPlayers
    };

    if (teamNum === 1) {
        team1Data = normalizedTeam;
    } else {
        team2Data = normalizedTeam;
    }

    document.getElementById(`team${teamNum}-name`).textContent = team.name;

    // Update venue selectors only when Team 1 is loaded (venue selectors only exist for Team 1)
    if (teamNum === 1) {
        updateVenueSelectors(teamNum);
    }

    createLineup(teamNum, normalizedTeam);

    // Update the UI theme dynamically based on selected teams
    if (typeof updateDynamicTheme === 'function') {
        updateDynamicTheme();
    }
}

// Update venue selector options based on selected team
function updateVenueSelectors(teamNum) {
    const teamSelect = document.getElementById(`team${teamNum}`);
    const teamKey = teamSelect.value;

    if (!teamKey || !venues[teamKey]) {
        return;
    }

    const teamVenue = venues[teamKey];
    const homeSelect = document.getElementById(`team${teamNum}-home-venue`);
    const neutralSelect = document.getElementById(`team${teamNum}-neutral-venue`);
    const titleEl = document.getElementById(`team${teamNum}-venue-title`);

    // Update title
    titleEl.textContent = `Match Venue`;

    // Clear existing options
    homeSelect.innerHTML = '<option value="">Select Home Ground</option>';
    neutralSelect.innerHTML = '<option value="">Select Neutral Ground</option>';

    // Add all home grounds for Team 1's country
    teamVenue.homeGrounds.forEach((ground, index) => {
        const option = document.createElement('option');
        option.value = `home-${index}`;
        option.textContent = `${ground.name} (${ground.city})`;
        homeSelect.appendChild(option);
    });

    // Add neutral ground options (all stadiums except Team 1's home stadiums)
    allStadiums.forEach((stadium, index) => {
        // Check if this stadium is NOT in Team 1's home grounds
        const isTeam1Home = teamVenue.homeGrounds.some(h => h.name === stadium.name);
        if (!isTeam1Home) {
            const option = document.createElement('option');
            option.value = `neutral-${stadium.name}`;
            option.textContent = `${stadium.name} (${stadium.city}, ${stadium.country})`;
            neutralSelect.appendChild(option);
        }
    });

    // Reset venue selections
    homeSelect.value = '';
    neutralSelect.value = '';
    document.getElementById(`team${teamNum}-venue-info`).innerHTML = '';
    team1Venue = null;
}

// Select a venue for the match
function selectVenue(teamNum, venueType) {
    const teamSelect = document.getElementById(`team${teamNum}`);
    const teamKey = teamSelect.value;

    if (!teamKey) {
        alert('Please select a team first');
        return;
    }

    let venueSelect, venues_array, isHome;

    if (venueType === 'home') {
        venueSelect = document.getElementById(`team${teamNum}-home-venue`);
        const neutralSelect = document.getElementById(`team${teamNum}-neutral-venue`);
        neutralSelect.value = ''; // Clear neutral selection
        venues_array = venues[teamKey].homeGrounds;
        isHome = true;
    } else {
        venueSelect = document.getElementById(`team${teamNum}-neutral-venue`);
        const homeSelect = document.getElementById(`team${teamNum}-home-venue`);
        homeSelect.value = ''; // Clear home selection
        // Extract stadium name from venue select value (format: "neutral-stadiumname")
        const venueName = venueSelect.value.split('-').slice(1).join('-');
        const selectedStadium = allStadiums.find(s => s.name === venueName);
        venues_array = selectedStadium ? [selectedStadium] : [];
        isHome = false;
    }

    const venueIndex = parseInt(venueSelect.value.split('-')[1]);
    const venueInfo = document.getElementById(`team${teamNum}-venue-info`);

    if (venueSelect.value === '') {
        venueInfo.innerHTML = '';
        team1Venue = null;
        return;
    }

    let selectedVenue;
    if (isHome) {
        selectedVenue = venues_array[venueIndex];
    } else {
        selectedVenue = allStadiums.find(s => s.name === venueSelect.value.split('-').slice(1).join('-'));
    }

    // Create venue info display
    venueInfo.innerHTML = '';
    venueInfo.className = isHome ? 'venue-info home' : 'venue-info';

    const p = document.createElement('p');
    if (isHome) {
        p.innerHTML = `<i class="fas fa-home"></i> ${selectedVenue.name} (+1 Boost to Team 1)`;
    } else {
        p.innerHTML = `<i class="fas fa-globe"></i> ${selectedVenue.name} (${selectedVenue.city})`;
    }
    venueInfo.appendChild(p);

    // Store venue selection
    team1Venue = {
        name: selectedVenue.name,
        city: selectedVenue.city,
        isHome: isHome
    };
}

// Apply home ground boost to team players
function applyVenueBoosts() {
    if (team1Venue && team1Venue.isHome && team1Data) {
        applyHomeBoost(team1Data);
    }
}

// Apply +1 boost to all attributes for home team
function applyHomeBoost(teamData) {
    teamData.players.forEach(player => {
        player.batting = Math.min(99, player.batting + 1);
        player.bowling = Math.min(99, player.bowling + 1);
    });
}

// Create lineup using Player Cards
function createLineup(teamNum, team) {
    const battingContainer = document.getElementById(`team${teamNum}-batting`);
    const benchContainer = document.getElementById(`team${teamNum}-bench`);
    const bowlingContainer = document.getElementById(`team${teamNum}-bowling`); // Expected but hidden

    // Clear existing lineups
    if (battingContainer) battingContainer.innerHTML = '';
    if (benchContainer) benchContainer.innerHTML = '';
    if (bowlingContainer) bowlingContainer.innerHTML = '';

    // Get best 11 players for the XI, put the rest on the bench
    const bestPlayers = getBestEleven(team.players);
    const benchPlayers = team.players.filter(p => !bestPlayers.some(bp => bp.name === p.name));

    // Populate Playing XI
    if (battingContainer) {
        bestPlayers.forEach((player, i) => {
            battingContainer.appendChild(createPlayerCard(teamNum, i + 1, player, team.players, 'batting'));
        });
    }

    // Populate Bench
    if (benchContainer) {
        benchPlayers.forEach((player, i) => {
            benchContainer.appendChild(createPlayerCard(teamNum, i + 1, player, team.players, 'bench'));
        });
    }

    updateSectionCounts(teamNum);
    initializeDragAndDrop(teamNum);
}
function createPlayerCard(teamNum, position, player, allPlayers, section) {
    const card = document.createElement('div');
    card.className = `player-card role-${player ? player.role : 'empty'}`;
    card.draggable = true;
    card.dataset.teamNum = teamNum;
    card.dataset.section = section;
    card.dataset.position = position;

    if (player) {
        card.dataset.playerName = player.name;
        card.dataset.playerRole = player.role;
        card.dataset.playerBatting = player.batting;
        card.dataset.playerBowling = player.bowling;
    }

    card.innerHTML = `
        <div class="player-number">${position}</div>
        <div class="player-info">
            <div class="player-name">${player ? player.name : 'Empty Slot'}</div>
            <div class="player-role">${player ? player.role.toUpperCase() : 'NO PLAYER'} ${player && player.battingCategory ? `- <span style="color:#818cf8; font-weight:700;">${player.battingCategory.toUpperCase()}</span>` : ''}</div>
            ${player ? `
                <div class="player-stats">
                    <span class="stat-badge">Bat: ${player.batting}</span>
                    <span class="stat-badge">Bowl: ${player.bowling}</span>
                </div>
            ` : ''}
        </div>
        ${player ? `
            <div class="player-actions">
                ${section === 'bench' ? `
                    <div class="action-icon add-to-batting" onclick="addPlayerToSection(${teamNum}, '${player.name}', 'batting')" title="Add to Playing XI">
                        <i class="fas fa-plus"></i>
                    </div>
                ` : `
                    <div class="action-icon move-up" onclick="movePlayer(${teamNum}, '${section}', ${position}, 'up')" title="Move Up">
                        <i class="fas fa-chevron-up"></i>
                    </div>
                    <div class="action-icon move-down" onclick="movePlayer(${teamNum}, '${section}', ${position}, 'down')" title="Move Down">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="action-icon remove-player" onclick="removePlayer(${teamNum}, '${section}', ${position})" title="Move to Bench">
                        <i class="fas fa-times"></i>
                    </div>
                `}
            </div>
        ` : ''}
    `;

    return card;
}

function updateTeamStats(teamNum, team) {
    const battingContainer = document.getElementById(`team${teamNum}-batting`);
    const playerCards = battingContainer.querySelectorAll('.player-card');

    let totalBatting = 0;
    let totalBowling = 0;
    let playerCount = 0;

    playerCards.forEach(card => {
        const playerName = card.dataset.playerName;
        if (playerName) {
            const player = team.players.find(p => p.name === playerName);
            if (player) {
                totalBatting += player.batting;
                totalBowling += player.bowling;
                playerCount++;
            }
        }
    });

    const avgBatting = playerCount > 0 ? Math.round(totalBatting / playerCount) : 0;
    const avgBowling = playerCount > 0 ? Math.round(totalBowling / playerCount) : 0;

    document.getElementById(`team${teamNum}-player-count`).textContent = playerCount;
    document.getElementById(`team${teamNum}-batting-avg`).textContent = avgBatting;
    document.getElementById(`team${teamNum}-bowling-avg`).textContent = avgBowling;
}

function updateSectionCounts(teamNum) {
    const battingCount = document.getElementById(`team${teamNum}-batting`).children.length;
    const bowlingCount = document.getElementById(`team${teamNum}-bowling`).children.length;
    const benchCount = document.getElementById(`team${teamNum}-bench`).children.length;

    document.getElementById(`team${teamNum}-batting-count`).textContent = `${battingCount}/11`;
    document.getElementById(`team${teamNum}-bowling-count`).textContent = `${bowlingCount}/5`;
    document.getElementById(`team${teamNum}-bench-count`).textContent = benchCount;
}

function initializeDragAndDrop(teamNum) {
    const sections = ['batting', 'bowling', 'bench'];

    sections.forEach(section => {
        const container = document.getElementById(`team${teamNum}-${section}`);
        const cards = container.querySelectorAll('.player-card');

        cards.forEach(card => {
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
        });

        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragenter', handleDragEnter);
        container.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.playerName || '');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    if (e.target.classList.contains('player-list')) {
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.target.classList.contains('player-list')) {
        e.target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const targetContainer = e.target.closest('.player-list');
    if (!targetContainer) return;

    targetContainer.classList.remove('drag-over');

    const draggedCard = document.querySelector('.dragging');
    if (!draggedCard) return;

    const sourceContainer = draggedCard.closest('.player-list');
    const targetCard = e.target.closest('.player-card');

    if (sourceContainer === targetContainer) {
        // Reordering within the same container
        if (targetCard && targetCard !== draggedCard) {
            const draggedIndex = Array.from(targetContainer.children).indexOf(draggedCard);
            const targetIndex = Array.from(targetContainer.children).indexOf(targetCard);
            if (draggedIndex < targetIndex) {
                targetContainer.insertBefore(draggedCard, targetCard.nextSibling);
            } else {
                targetContainer.insertBefore(draggedCard, targetCard);
            }
        } else if (!targetCard) {
            targetContainer.appendChild(draggedCard);
        }
        updateCardPositions(targetContainer);
    } else {
        // Moving between different sections (e.g., Bench to XI)
        const teamNum = draggedCard.dataset.teamNum;
        const playerName = draggedCard.dataset.playerName;

        let targetSection = targetContainer.id.includes('batting') ? 'batting' : 'bench';
        let sourceSection = sourceContainer.id.includes('batting') ? 'batting' : 'bench';

        const teamSelect = document.getElementById(`team${teamNum}`);
        const team = teams[teamSelect.value];
        const player = team.players.find(p => p.name === playerName);

        if (!player) return;

        // Hard cap checking for Batting list
        if (targetSection === 'batting' && targetContainer.children.length >= 11) {
            if (targetCard) {
                // Allow Swap!
                const targetPlayerName = targetCard.dataset.playerName;
                const targetPlayerObj = team.players.find(p => p.name === targetPlayerName);

                const newBenchCard = createPlayerCard(teamNum, sourceContainer.children.length + 1, targetPlayerObj, team.players, 'bench');
                sourceContainer.appendChild(newBenchCard);
            } else {
                alert('Batting lineup is full (11 players maximum). Drag the player directly over someone to swap, or manually remove a player first.');
                return;
            }
        }

        // Re-create the dragged card for the new section so action buttons update correctly
        const newCard = createPlayerCard(teamNum, 1, player, team.players, targetSection);

        if (targetCard) {
            targetContainer.insertBefore(newCard, targetCard);
            // If we swapped a player out of a full batting lineup, remove that target now
            if (targetSection === 'batting' && targetContainer.querySelectorAll('.player-card').length > 11) {
                targetCard.remove();
            }
        } else {
            targetContainer.appendChild(newCard);
        }

        draggedCard.remove();

        updateCardPositions(targetContainer);
        updateCardPositions(sourceContainer);
        updateSectionCounts(teamNum);

        // Re-attach listeners just in case
        initializeDragAndDrop(teamNum);
    }
}

function updateCardPositions(container) {
    const cards = container.querySelectorAll('.player-card');
    cards.forEach((card, index) => {
        const numberElement = card.querySelector('.player-number');
        if (numberElement) {
            numberElement.textContent = index + 1;
        }
        card.dataset.position = index + 1;
    });
}

function movePlayer(teamNum, section, position, direction) {
    const container = document.getElementById(`team${teamNum}-${section}`);
    const cards = Array.from(container.children);
    const currentIndex = position - 1;

    if (direction === 'up' && currentIndex > 0) {
        const temp = cards[currentIndex];
        cards[currentIndex] = cards[currentIndex - 1];
        cards[currentIndex - 1] = temp;
    } else if (direction === 'down' && currentIndex < cards.length - 1) {
        const temp = cards[currentIndex];
        cards[currentIndex] = cards[currentIndex + 1];
        cards[currentIndex + 1] = temp;
    }

    // Re-render the container
    container.innerHTML = '';
    cards.forEach(card => container.appendChild(card));
    updateCardPositions(container);
}

function removePlayer(teamNum, section, position) {
    const container = document.getElementById(`team${teamNum}-${section}`);
    const card = container.querySelector(`[data-position="${position}"]`);

    if (card) {
        // Move to bench
        const benchContainer = document.getElementById(`team${teamNum}-bench`);
        const playerName = card.dataset.playerName;

        if (playerName) {
            // Find the player data
            const teamSelect = document.getElementById(`team${teamNum}`);
            const teamKey = teamSelect.value;
            const team = teams[teamKey];
            const player = team.players.find(p => p.name === playerName);

            if (player) {
                const benchPosition = benchContainer.children.length + 1;
                const benchCard = createPlayerCard(teamNum, benchPosition, player, team.players, 'bench');
                benchContainer.appendChild(benchCard);

                // Remove from current section
                card.remove();

                // Update positions
                updateCardPositions(container);
                updateCardPositions(benchContainer);
                updateSectionCounts(teamNum);
                updateTeamStats(teamNum, team);
            }
        }
    }
}

function optimizeLineups() {
    // Auto-optimize both teams
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');

    if (team1Select.value) {
        const team1 = teams[team1Select.value];
        createLineup(1, team1);
    }

    if (team2Select.value) {
        const team2 = teams[team2Select.value];
        createLineup(2, team2);
    }
}

function addPlayerToSection(teamNum, playerName, targetSection) {
    const teamSelect = document.getElementById(`team${teamNum}`);
    const teamKey = teamSelect.value;
    const team = teams[teamKey];
    const player = team.players.find(p => p.name === playerName);

    if (!player) return;

    const targetContainer = document.getElementById(`team${teamNum}-${targetSection}`);
    const benchContainer = document.getElementById(`team${teamNum}-bench`);

    // Find the player card in bench
    const benchCard = benchContainer.querySelector(`[data-player-name="${playerName}"]`);
    if (!benchCard) return;

    // Check if target section has space
    if (targetSection === 'batting' && targetContainer.children.length >= 11) {
        alert('Batting lineup is full (11 players maximum)');
        return;
    }

    if (targetSection === 'bowling' && targetContainer.children.length >= 5) {
        alert('Bowling lineup is full (5 players maximum)');
        return;
    }

    // Add to target section
    const newPosition = targetContainer.children.length + 1;
    const newCard = createPlayerCard(teamNum, newPosition, player, team.players, targetSection);
    targetContainer.appendChild(newCard);

    // Remove from bench
    benchCard.remove();

    // Update positions and counts
    updateCardPositions(targetContainer);
    updateCardPositions(benchContainer);
    updateSectionCounts(teamNum);
    updateTeamStats(teamNum, team);

    // Reinitialize drag and drop
    initializeDragAndDrop(teamNum);
}

function resetLineups() {
    // Reset both teams
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');

    if (team1Select.value) {
        const team1 = teams[team1Select.value];
        createLineup(1, team1);
    }

    if (team2Select.value) {
        const team2 = teams[team2Select.value];
        createLineup(2, team2);
    }
}

// Get best 11 players for a team (batsmen first, then all-rounders, then bowlers)
function getBestEleven(players) {
    // Separate by role
    const batsmen = players.filter(p => p.role === 'batsman').sort((a, b) => b.batting - a.batting);
    const wicketkeepers = players.filter(p => p.role === 'wicketkeeper').sort((a, b) => b.batting - a.batting);
    const allrounders = players.filter(p => p.role === 'allrounder').sort((a, b) => (b.batting + b.bowling) - (a.batting + a.bowling));
    const bowlers = players.filter(p => p.role === 'bowler').sort((a, b) => b.bowling - a.bowling);

    let selectedBatsmen = [];
    let selectedAllrounders = [];
    let selectedBowlers = [];

    // 0. Auto Pick exactly one Wicketkeeper
    if (wicketkeepers.length > 0) {
        selectedBatsmen.push(wicketkeepers[0]);
    }

    // Combine any remaining wicketkeepers back into the batsman pool (they can play purely as batters if they're good enough)
    const remainingBatsmen = [...batsmen, ...wicketkeepers.slice(1)].sort((a, b) => b.batting - a.batting);

    // 1. Add at least 3 bowlers
    selectedBowlers = bowlers.slice(0, 3);
    // 2. Add at least 1 allrounder
    selectedAllrounders = allrounders.slice(0, 1);
    // 3. Add more allrounders to make at least 5 bowlers+allrounders
    let bowlersAndAllrounders = 3 + 1;
    let allrounderIdx = 1;
    while (bowlersAndAllrounders < 5 && allrounderIdx < allrounders.length) {
        selectedAllrounders.push(allrounders[allrounderIdx]);
        bowlersAndAllrounders++;
        allrounderIdx++;
    }
    // 4. Fill up to 11 with best batsmen, then more allrounders/bowlers if needed
    let used = new Set([...selectedBatsmen, ...selectedAllrounders, ...selectedBowlers].map(p => p.name));
    for (let i = 0; i < remainingBatsmen.length && (selectedBatsmen.length + selectedAllrounders.length + selectedBowlers.length) < 11; i++) {
        if (!used.has(remainingBatsmen[i].name)) {
            selectedBatsmen.push(remainingBatsmen[i]);
            used.add(remainingBatsmen[i].name);
        }
    }
    for (; allrounderIdx < allrounders.length && (selectedBatsmen.length + selectedAllrounders.length + selectedBowlers.length) < 11; allrounderIdx++) {
        if (!used.has(allrounders[allrounderIdx].name)) {
            selectedAllrounders.push(allrounders[allrounderIdx]);
            used.add(allrounders[allrounderIdx].name);
        }
    }
    for (let i = 3; i < bowlers.length && (selectedBatsmen.length + selectedAllrounders.length + selectedBowlers.length) < 11; i++) {
        if (!used.has(bowlers[i].name)) {
            selectedBowlers.push(bowlers[i]);
            used.add(bowlers[i].name);
        }
    }
    // 5. If still not 11, fill with any remaining best players
    if ((selectedBatsmen.length + selectedAllrounders.length + selectedBowlers.length) < 11) {
        const remaining = players.filter(p => !used.has(p.name)).sort((a, b) => (b.batting + b.bowling) - (a.batting + a.bowling));
        for (let i = 0; i < remaining.length && (selectedBatsmen.length + selectedAllrounders.length + selectedBowlers.length) < 11; i++) {
            // Place in correct group
            if (remaining[i].role === 'batsman' || remaining[i].role === 'wicketkeeper') selectedBatsmen.push(remaining[i]);
            else if (remaining[i].role === 'allrounder') selectedAllrounders.push(remaining[i]);
            else selectedBowlers.push(remaining[i]);
        }
    }

    const finalXI = [...selectedBatsmen, ...selectedAllrounders, ...selectedBowlers].slice(0, 11);

    // Fallback classification if somehow a player wasn't categorized
    finalXI.forEach((p) => {
        if (!p.battingCategory) {
            if (p.role === 'batsman' || p.role === 'wicketkeeper') p.battingCategory = 'middleOrder';
            else if (p.role === 'allrounder') p.battingCategory = 'middleOrder';
            else p.battingCategory = 'lowerOrder';
        }
    });

    const categoryOrder = { 'opener': 1, 'topOrder': 2, 'middleOrder': 3, 'lowerOrder': 4 };

    // Sort array based on the dynamic batting category
    finalXI.sort((a, b) => {
        const orderA = categoryOrder[a.battingCategory] || 4;
        const orderB = categoryOrder[b.battingCategory] || 4;
        return orderA - orderB;
    });

    return finalXI;
}

// Set match type
function setMatchType(type) {
    currentMatchType = type;

    // Update button states
    document.querySelectorAll('.match-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Find and activate the correct button
    const activeButton = document.querySelector(`[onclick="setMatchType('${type}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Commentary helper function
function addCommentary(innings, over, ball, batsman, bowler, outcome, runs) {
    let commentaryText = "";
    let isExtra = outcome === 'wide' || outcome === 'noball';
    let overStr = `${over}.${ball + (isExtra ? 0 : 1)}`;
    const outLines = [
        `<b>OUT!</b> ${batsman.name} is dismissed!`,
        `<b>WICKET!</b> ${bowler.name} strikes, ${batsman.name} has to walk back.`,
        `<b>GONE!</b> Fantastic delivery from ${bowler.name}, ${batsman.name} is out.`,
        `<b>OUT!</b> What a breakthrough! ${batsman.name} departs.`,
        `<b>WICKET!</b> Plumb in front or edged? Either way, ${batsman.name} is gone.`,
        `<b>WICKET!</b> Taken in the deep. ${batsman.name} departs.`,
        `<b>OUT!</b> The pressure was building and ${batsman.name} perishes.`
    ];
    const wideLines = [
        `Wide ball from ${bowler.name}.`,
        `Way down the leg side, the umpire signals wide.`,
        `Too wide outside off stump from ${bowler.name}.`,
        `Extra run added, ${bowler.name} loses their line.`,
        `Wide called. The bowler needs to tighten up.`,
        `Poor line from ${bowler.name}, that's a wide.`
    ];
    const noballLines = [
        `No ball! Extra run.`,
        `Overstepping by ${bowler.name}, it's a no ball!`,
        `High full toss, umpire calls a no ball.`,
        `No ball signaled! Free hit coming up.`,
        `Foot over the line, costly error from ${bowler.name}.`,
        `No ball! ${batsman.name} survives and gets an extra run.`
    ];
    const fourLines = [
        `<b>FOUR!</b> Beautiful shot by ${batsman.name}.`,
        `<b>FOUR!</b> Pierces the gap perfectly, ${batsman.name} gets a boundary.`,
        `<b>FOUR!</b> Cracking cover drive from ${batsman.name} for four runs!`,
        `<b>FOUR!</b> Smashed away by ${batsman.name}, one bounce over the ropes.`,
        `<b>FOUR!</b> Up and over the infield, exquisite timing by ${batsman.name}.`,
        `<b>FOUR!</b> Poor delivery by ${bowler.name} and punished by ${batsman.name}.`
    ];
    const sixLines = [
        `<b>SIX!</b> Massive hit by ${batsman.name}!`,
        `<b>SIX!</b> That's huge! ${batsman.name} deposits it into the stands.`,
        `<b>SIX!</b> Clean strike! ${batsman.name} hits it right out of the screws.`,
        `<b>SIX!</b> ${bowler.name} is dispatched into the crowd by ${batsman.name}.`,
        `<b>SIX!</b> Stand and deliver! Brilliant maximum from ${batsman.name}.`,
        `<b>SIX!</b> Into the stands by ${batsman.name}!`,
        `<b>SIX!</b> Sails over the boundary ropes, ${batsman.name} is on fire!`
    ];
    const dotLines = [
        `No run. Solid defense by ${batsman.name}.`,
        `Dot ball. Good tight bowling from ${bowler.name}.`,
        `Beaten! Lovely delivery by ${bowler.name}, ${batsman.name} misses it.`,
        `Pushed straight to the fielder by ${batsman.name}, no run.`,
        `Well bowled by ${bowler.name}, ${batsman.name} respects it.`,
        `Plays and misses! ${batsman.name} struggles to connect.`
    ];
    const singleLines = [
        `1 run to ${batsman.name}.`,
        `Tapped softly for a quick single by ${batsman.name}.`,
        `Pushed into the gap, they jog through for one.`,
        `Good running between the wickets, a single taken.`,
        `Just a single off ${bowler.name}'s bowling.`,
        `Smart batting, ${batsman.name} rotates the strike.`
    ];
    const doubleLines = [
        `2 runs to ${batsman.name}.`,
        `Excellent running! They push hard and get two.`,
        `Flicked away into the deep by ${batsman.name} for a couple.`,
        `Good placement by ${batsman.name}, comes back for the second run.`,
        `Two runs added to the total off ${bowler.name}.`,
        `They scurry back for the second. Great fitness shown by ${batsman.name}.`
    ];

    if (outcome === 'out') {
        commentaryText = outLines[Math.floor(Math.random() * outLines.length)];
    } else if (outcome === 'wide') {
        commentaryText = wideLines[Math.floor(Math.random() * wideLines.length)];
    } else if (outcome === 'noball') {
        commentaryText = noballLines[Math.floor(Math.random() * noballLines.length)];
    } else if (runs === 4) {
        commentaryText = fourLines[Math.floor(Math.random() * fourLines.length)];
    } else if (runs === 6) {
        commentaryText = sixLines[Math.floor(Math.random() * sixLines.length)];
    } else if (runs === 0) {
        commentaryText = dotLines[Math.floor(Math.random() * dotLines.length)];
    } else if (runs === 1) {
        commentaryText = singleLines[Math.floor(Math.random() * singleLines.length)];
    } else if (runs === 2) {
        commentaryText = doubleLines[Math.floor(Math.random() * doubleLines.length)];
    } else {
        commentaryText = `${runs} run${runs > 1 ? 's' : ''} to ${batsman.name}.`;
    }

    let milestoneText = "";
    if (innings.batting) {
        const batStats = innings.batting.find(b => b.name === batsman.name);
        if (batStats && outcome !== 'out' && runs > 0) {
            let previousScore = batStats.runs - runs;
            if (previousScore < 50 && batStats.runs >= 50) {
                milestoneText = ` <br><span style="color:#fbbf24; font-weight:bold; font-size: 1.1em; padding-top: 4px; display: inline-block;">🌟 FIFTY! Brilliant half-century by ${batsman.name} off ${batStats.balls} balls.</span>`;
            } else if (previousScore < 100 && batStats.runs >= 100) {
                milestoneText = ` <br><span style="color:#fbbf24; font-weight:bold; font-size: 1.1em; padding-top: 4px; display: inline-block;">💯 CENTURY! What an incredible 100 for ${batsman.name} off ${batStats.balls} balls!</span>`;
            } else if (previousScore < 150 && batStats.runs >= 150) {
                milestoneText = ` <br><span style="color:#fbbf24; font-weight:bold; font-size: 1.1em; padding-top: 4px; display: inline-block;">🔥 150 UP! Spectacular knock by ${batsman.name} off ${batStats.balls} balls.</span>`;
            } else if (previousScore < 200 && batStats.runs >= 200) {
                milestoneText = ` <br><span style="color:#fbbf24; font-weight:bold; font-size: 1.1em; padding-top: 4px; display: inline-block;">👑 DOUBLE CENTURY! A legendary 200 by ${batsman.name} off ${batStats.balls} balls!</span>`;
            }
        }
    }

    commentaryText += milestoneText;

    if (!innings.commentary) innings.commentary = [];
    innings.commentary.push({
        overStr: overStr,
        bowler: bowler.name,
        batsman: batsman.name,
        text: commentaryText,
        score: `${innings.total}/${innings.wickets}`,
        isWicket: outcome === 'out',
        isBoundary: runs === 4 || runs === 6
    });
}

// Commentary State Variables
let commentaryState = {
    inningsList: [],
    currentInningsIdx: 0,
    currentBallIdx: 0,
    interval: null,
    onComplete: null,
    teamNames: []
};

// Simulate a match
function simulateMatch(showCommentary = false) {
    if (!team1Data || !team2Data) {
        alert('Please select both teams first!');
        return;
    }
    // Prevent simulation when both teams are the same
    if (team1Data.name === team2Data.name) {
        alert('Please select different teams for the match!');
        return;
    }

    // Apply home ground boosts before match simulation
    applyVenueBoosts();

    // Validate lineups for both teams
    const team1Lineup = getBattingLineup(team1Data, 1);
    const team2Lineup = getBattingLineup(team2Data, 2);
    if (!validateLineup(team1Lineup)) {
        alert('Team 1 lineup must have at least 1 wicketkeeper, at least 3 bowlers (excluding allrounders), at least 5 bowlers+allrounders, and at least 1 allrounder.');
        return;
    }
    if (!validateLineup(team2Lineup)) {
        alert('Team 2 lineup must have at least 1 wicketkeeper, at least 3 bowlers (excluding allrounders), at least 5 bowlers+allrounders, and at least 1 allrounder.');
        return;
    }
    // Automatic toss and decision
    tossWinner = Math.random() < 0.5 ? team1Data.name : team2Data.name;
    tossDecision = Math.random() < 0.5 ? 'bat' : 'bowl';

    const config = matchConfigs[currentMatchType];
    matchResults = {
        team1: { name: team1Data.name, innings: [] },
        team2: { name: team2Data.name, innings: [] },
        winner: null,
        matchType: currentMatchType,
        tossWinner: tossWinner,
        tossDecision: tossDecision
    };

    // Determine batting order based on toss
    let firstBattingTeam, secondBattingTeam;
    if (tossDecision === 'bat') {
        // Toss winner chose to bat first
        firstBattingTeam = tossWinner === team1Data.name ? team1Data : team2Data;
        secondBattingTeam = tossWinner === team1Data.name ? team2Data : team1Data;
    } else {
        // Toss winner chose to bowl first
        firstBattingTeam = tossWinner === team1Data.name ? team2Data : team1Data;
        secondBattingTeam = tossWinner === team1Data.name ? team1Data : team2Data;
    }

    if (currentMatchType === 'test') {
        // Test match: 4 innings (2 per team)
        // First innings
        const firstInnings = simulateInnings(firstBattingTeam, secondBattingTeam, config, 1);
        matchResults.team1.innings.push(firstInnings);

        // Second innings - no target, continue until all out
        const secondInnings = simulateInnings(secondBattingTeam, firstBattingTeam, config, 2, null);
        matchResults.team2.innings.push(secondInnings);

        // Third innings - no target, continue until all out
        const thirdInnings = simulateInnings(firstBattingTeam, secondBattingTeam, config, 3, null);
        matchResults.team1.innings.push(thirdInnings);

        // Fourth innings - chase logic applies here
        const targetForSecondTeam = firstInnings.total + thirdInnings.total - secondInnings.total;
        const fourthInnings = simulateInnings(secondBattingTeam, firstBattingTeam, config, 4, targetForSecondTeam > 0 ? targetForSecondTeam : null);
        matchResults.team2.innings.push(fourthInnings);

        // Determine winner for test match
        const team1Total = firstInnings.total + thirdInnings.total;
        const team2Total = secondInnings.total + fourthInnings.total;

        if (fourthInnings.targetReached) {
            // Fourth innings team successfully chased the target
            matchResults.winner = secondBattingTeam.name;
            matchResults.margin = team1Total - team2Total;
            matchResults.resultType = 'wickets';
        } else if (team2Total > team1Total) {
            matchResults.winner = secondBattingTeam.name;
            matchResults.margin = team2Total - team1Total;
            matchResults.resultType = 'runs';
        } else if (team1Total > team2Total) {
            matchResults.winner = firstBattingTeam.name;
            matchResults.margin = team1Total - team2Total;
            matchResults.resultType = 'runs';
        } else {
            matchResults.winner = 'Draw';
            matchResults.margin = 0;
            matchResults.resultType = 'draw';
        }
    } else {
        // Limited overs match: 2 innings (1 per team) with chase logic
        const firstInnings = simulateInnings(firstBattingTeam, secondBattingTeam, config, 1);
        matchResults.team1.innings.push(firstInnings);

        const secondInnings = simulateInnings(secondBattingTeam, firstBattingTeam, config, 2, firstInnings.total);
        matchResults.team2.innings.push(secondInnings);

        // Determine winner for limited overs
        if (secondInnings.targetReached) {
            // Second team successfully chased the target
            matchResults.winner = secondBattingTeam.name;
            matchResults.margin = firstInnings.total - secondInnings.total;
            matchResults.resultType = 'wickets';
        } else if (secondInnings.total > firstInnings.total) {
            matchResults.winner = secondBattingTeam.name;
            matchResults.margin = secondInnings.total - firstInnings.total;
            matchResults.resultType = 'runs';
        } else if (firstInnings.total > secondInnings.total) {
            matchResults.winner = firstBattingTeam.name;
            matchResults.margin = firstInnings.total - secondInnings.total;
            matchResults.resultType = 'runs';
        } else {
            matchResults.winner = 'Tie';
            matchResults.margin = 0;
            matchResults.resultType = 'tie';
        }
    }

    if (showCommentary) {
        let inningsList = [];
        let teamNames = [];

        if (currentMatchType === 'test') {
            inningsList = [
                matchResults.team1.innings[0],
                matchResults.team2.innings[0],
                matchResults.team1.innings[1],
                matchResults.team2.innings[1]
            ];
            teamNames = [
                firstBattingTeam.name,
                secondBattingTeam.name,
                firstBattingTeam.name,
                secondBattingTeam.name
            ];
        } else {
            inningsList = [
                matchResults.team1.innings[0],
                matchResults.team2.innings[0]
            ];
            teamNames = [
                firstBattingTeam.name,
                secondBattingTeam.name
            ];
        }

        startCommentaryPlayback(inningsList, { teamNames }, displayResults);
    } else {
        displayResults();
    }
}

// Commentary Playback Functions
function startCommentaryPlayback(inningsList, matchContext, onComplete) {
    commentaryState = {
        inningsList: inningsList,
        currentInningsIdx: 0,
        currentBallIdx: 0,
        interval: null,
        onComplete: onComplete,
        matchContext: matchContext
    };

    document.querySelector('.match-setup').style.display = 'none';
    document.querySelector('.venue-setup').style.display = 'none';
    document.querySelector('.lineup-management').style.display = 'none';
    document.querySelector('.simulation-controls').style.display = 'none';
    document.getElementById('match-results').style.display = 'none';

    const commPanel = document.getElementById('commentary-panel');
    if (commPanel) {
        commPanel.style.display = 'block';
        commPanel.scrollIntoView({ behavior: 'smooth' });
    }

    document.getElementById('commentary-box').innerHTML = '';
    document.getElementById('commentary-score').innerHTML = 'Starting match...';

    playNextBall();
}

function playNextBall() {
    if (commentaryState.interval) clearTimeout(commentaryState.interval);

    const innings = commentaryState.inningsList[commentaryState.currentInningsIdx];
    if (!innings || !innings.commentary) {
        finishCommentary();
        return;
    }

    if (commentaryState.currentBallIdx >= innings.commentary.length) {
        // End of innings
        commentaryState.currentInningsIdx++;
        commentaryState.currentBallIdx = 0;

        if (commentaryState.currentInningsIdx >= commentaryState.inningsList.length) {
            finishCommentary();
            return;
        } else {
            // Add a divider for new innings
            const box = document.getElementById('commentary-box');
            box.innerHTML += `<div style="text-align:center; font-weight:bold; margin:15px 0; color:#4f46e5;">--- START OF INNINGS ${commentaryState.currentInningsIdx + 1} ---</div>`;
            box.scrollTop = box.scrollHeight;
            commentaryState.interval = setTimeout(playNextBall, 1500);
            return;
        }
    }

    const ball = innings.commentary[commentaryState.currentBallIdx];

    // Render ball
    const box = document.getElementById('commentary-box');
    const bg = ball.isWicket ? '#450a0a' : (ball.isBoundary ? '#1e1b4b' : '#262626');
    const border = ball.isWicket ? '#dc2626' : (ball.isBoundary ? '#6366f1' : '#404040');

    box.innerHTML += `
        <div style="background:${bg}; border-left:4px solid ${border}; padding:10px; border-radius:4px; display:flex; gap:15px;">
            <div style="font-weight:bold; min-width:45px;">${ball.overStr}</div>
            <div>${ball.text}</div>
        </div>
    `;

    document.getElementById('commentary-score').innerHTML = `${commentaryState.matchContext.teamNames[commentaryState.currentInningsIdx]}: ${ball.score}`;

    box.scrollTop = box.scrollHeight;

    commentaryState.currentBallIdx++;
    commentaryState.interval = setTimeout(playNextBall, 600);
}

function skipToInningsEnd() {
    if (commentaryState.interval) clearTimeout(commentaryState.interval);

    const innings = commentaryState.inningsList[commentaryState.currentInningsIdx];
    if (!innings || !innings.commentary) return;

    // Quickly render all remaining balls in this innings
    const box = document.getElementById('commentary-box');
    while (commentaryState.currentBallIdx < innings.commentary.length) {
        const ball = innings.commentary[commentaryState.currentBallIdx];
        const bg = ball.isWicket ? '#450a0a' : (ball.isBoundary ? '#1e1b4b' : '#262626');
        const border = ball.isWicket ? '#dc2626' : (ball.isBoundary ? '#6366f1' : '#404040');
        box.innerHTML += `
            <div style="background:${bg}; border-left:4px solid ${border}; padding:10px; border-radius:4px; display:flex; gap:15px;">
                <div style="font-weight:bold; min-width:45px;">${ball.overStr}</div>
                <div>${ball.text}</div>
            </div>
        `;
        document.getElementById('commentary-score').innerHTML = `${commentaryState.matchContext.teamNames[commentaryState.currentInningsIdx]}: ${ball.score}`;
        commentaryState.currentBallIdx++;
    }
    box.scrollTop = box.scrollHeight;

    playNextBall();
}

function skipToMatchEnd() {
    if (commentaryState.interval) clearTimeout(commentaryState.interval);
    finishCommentary();
}

function finishCommentary() {
    document.getElementById('commentary-panel').style.display = 'none';
    document.querySelector('.match-setup').style.display = 'flex';
    document.querySelector('.venue-setup').style.display = 'block';
    document.querySelector('.lineup-management').style.display = 'block';
    document.querySelector('.simulation-controls').style.display = 'block';
    if (commentaryState.onComplete) {
        commentaryState.onComplete();
    }
}

// Simulate an innings
function simulateInnings(battingTeam, bowlingTeam, config, inningsNum, target = null) {
    // Determine which team is batting and which is bowling based on innings number
    let battingTeamNum, bowlingTeamNum;

    if (inningsNum === 1) {
        // Team 1 batting, Team 2 bowling
        battingTeamNum = 1;
        bowlingTeamNum = 2;
    } else if (inningsNum === 2) {
        // Team 2 batting, Team 1 bowling
        battingTeamNum = 2;
        bowlingTeamNum = 1;
    } else if (inningsNum === 3) {
        // Team 1 batting again, Team 2 bowling
        battingTeamNum = 1;
        bowlingTeamNum = 2;
    } else if (inningsNum === 4) {
        // Team 2 batting again, Team 1 bowling
        battingTeamNum = 2;
        bowlingTeamNum = 1;
    }

    const battingLineup = getBattingLineup(battingTeam, battingTeamNum);
    const bowlingLineup = getBowlingLineup(bowlingTeam, bowlingTeamNum);
    const fieldingLineupFull = getBattingLineup(bowlingTeam, bowlingTeamNum);

    const innings = {
        total: 0,
        wickets: 0,
        overs: 0,
        batting: [],
        bowling: [],
        targetReached: false
    };

    // Initialize batting stats
    battingLineup.forEach(player => {
        innings.batting.push({
            name: player.name,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            dismissal: null
        });
    });

    // Initialize bowling stats (only for those who actually bowl)
    let bowlerStats = {};
    bowlingLineup.forEach(player => {
        bowlerStats[player.name] = {
            name: player.name,
            overs: 0,
            balls: 0, // Track balls bowled
            maidens: 0,
            runs: 0,
            wickets: 0,
            economy: 0,
            currentSpellOvers: 0,
            spellLimit: 0
        };
    });

    function getSpellLimit(matchType) {
        if (matchType === 't20') return Math.floor(Math.random() * 2) + 2; // 2 to 3
        if (matchType === 'odi') return Math.floor(Math.random() * 3) + 4; // 4 to 6
        return Math.floor(Math.random() * 4) + 4; // 4 to 7
    }

    let activeBowlers = [0, Math.min(1, bowlingLineup.length - 1)]; // bowlers for two ends
    bowlerStats[bowlingLineup[activeBowlers[0]].name].spellLimit = getSpellLimit(currentMatchType);
    bowlerStats[bowlingLineup[activeBowlers[1]].name].spellLimit = getSpellLimit(currentMatchType);

    let currentBatsman1 = 0;
    let currentBatsman2 = 1;
    let overRuns = 0;
    for (let over = 0; over < config.overs && innings.wickets < config.maxWickets; over++) {
        overRuns = 0;
        let endIdx = over % 2;
        let otherEndIdx = (over + 1) % 2;
        let currentBowler = activeBowlers[endIdx];

        let maxBalls = currentMatchType === 't20' ? 24 : (currentMatchType === 'odi' ? 60 : 9999);
        let bStats = bowlerStats[bowlingLineup[currentBowler].name];

        // Change bowler if max balls reached or spell limit reached
        if (bStats.balls >= maxBalls || bStats.currentSpellOvers >= bStats.spellLimit) {
            let otherBowler = activeBowlers[otherEndIdx];
            let attempts = 0;
            let nextBowler = (currentBowler + 1) % bowlingLineup.length;
            while (attempts < bowlingLineup.length) {
                if (nextBowler !== otherBowler && bowlerStats[bowlingLineup[nextBowler].name].balls < maxBalls) {
                    break;
                }
                nextBowler = (nextBowler + 1) % bowlingLineup.length;
                attempts++;
            }
            currentBowler = nextBowler;
            activeBowlers[endIdx] = currentBowler;

            let newStats = bowlerStats[bowlingLineup[currentBowler].name];
            newStats.currentSpellOvers = 0;
            newStats.spellLimit = getSpellLimit(currentMatchType);
        }

        for (let ball = 0; ball < 6 && innings.wickets < config.maxWickets; ball++) {
            const batsman = battingLineup[currentBatsman1];
            const bowler = bowlingLineup[currentBowler];
            let outcome = calculateBallOutcome(batsman, bowler);

            // Enforce golden duck only rule
            if (outcome === 'out' && innings.batting[currentBatsman1].runs === 0 && innings.batting[currentBatsman1].balls > 0) {
                outcome = '0';
            }

            // Increment balls for legal deliveries
            if (outcome !== 'wide' && outcome !== 'noball') {
                innings.batting[currentBatsman1].balls++;
            }

            let runs = 0;
            if (outcome === 'out') {
                innings.batting[currentBatsman1].dismissal = getRandomDismissal(batsman, bowler, fieldingLineupFull, true);
                innings.wickets++;
                bowlerStats[bowler.name].wickets++;
            } else if (['0', '1', '2', '3', '4', '6'].includes(outcome)) {
                runs = parseInt(outcome);
                // Allow teams to cross the target - don't cap runs
                innings.batting[currentBatsman1].runs += runs;
                if (runs === 4) innings.batting[currentBatsman1].fours++;
                if (runs === 6) innings.batting[currentBatsman1].sixes++;
                innings.total += runs;
                bowlerStats[bowler.name].runs += runs;
                overRuns += runs;
            } else if (outcome === 'wide' || outcome === 'noball') {
                innings.total += 1;
                bowlerStats[bowler.name].runs += 1;
                overRuns += 1;
            }

            // Increment balls for legal deliveries
            if (outcome !== 'wide' && outcome !== 'noball') {
                bowlerStats[bowler.name].balls = (bowlerStats[bowler.name].balls || 0) + 1;
                bowlerStats[bowler.name].overs = ((over * 6 + ball + 1) / 6).toFixed(1);
            }

            addCommentary(innings, over, ball, batsman, bowler, outcome, runs);

            if (outcome === 'out') {
                currentBatsman1 = Math.max(currentBatsman1, currentBatsman2) + 1;
                if (currentBatsman1 >= battingLineup.length) break;
            } else if (['0', '1', '2', '3', '4', '6'].includes(outcome)) {
                if (runs % 2 === 1) {
                    [currentBatsman1, currentBatsman2] = [currentBatsman2, currentBatsman1];
                }
            } else if (outcome === 'wide' || outcome === 'noball') {
                ball--;
                continue; // Don't increment balls for extras
            }

            // In tournament mode, only stop if target is crossed (not just reached)
            if (target && innings.total > target) {
                innings.targetReached = true;
                break;
            }
        }
        if (overRuns === 0) {
            bowlerStats[bowlingLineup[currentBowler].name].maidens++;
        }
        bowlerStats[bowlingLineup[currentBowler].name].currentSpellOvers++;
        innings.overs = over + 1;
        // In tournament mode, only stop if target is crossed (not just reached)
        if (target && innings.total > target) break;
    }
    // Calculate economy rates
    Object.values(bowlerStats).forEach(bowler => {
        const oversNum = parseFloat(bowler.overs);
        if (oversNum > 0) {
            bowler.economy = (bowler.runs / oversNum).toFixed(2);
        }
    });
    // When copying to innings.bowling, set overs as balls/6 in x.y format
    innings.bowling = Object.values(bowlerStats).filter(b => b.balls > 0).map(b => {
        const overs = Math.floor(b.balls / 6) + "." + (b.balls % 6);
        return { ...b, overs };
    });
    return innings;
}

// Get batting lineup from selected players
function getBattingLineup(team, teamNum) {
    const lineup = [];
    const container = document.getElementById(`team${teamNum}-batting`);

    if (container && container.querySelector('.player-card')) {
        const cards = container.querySelectorAll('.player-card');
        cards.forEach(card => {
            const playerName = card.dataset.playerName;
            if (playerName) {
                const player = team.players.find(p => p.name === playerName);
                if (player) lineup.push(player);
            }
        });
    } else {
        // Fallback backward compatibility in case UI fails
        for (let i = 1; i <= 11; i++) {
            const select = document.getElementById(`team${teamNum}-bat-${i}`);
            if (select && select.value) {
                const player = team.players.find(p => p.name === select.value);
                if (player) lineup.push(player);
            }
        }
    }
    return lineup;
}

// Get bowling lineup from selected players (from the batting lineup)
function getBowlingLineup(team, teamNum) {
    const battingLineup = getBattingLineup(team, teamNum);
    const bowlers = battingLineup.filter(player => player.bowling > 50).sort((a, b) => b.bowling - a.bowling);

    // Ensure at least 3 bowlers, but prefer more if available
    if (bowlers.length < 3) {
        // If not enough bowlers, add players with lower bowling skills
        const allPlayers = battingLineup.sort((a, b) => b.bowling - a.bowling);
        const additionalBowlers = allPlayers.filter(player => !bowlers.includes(player)).slice(0, 3 - bowlers.length);
        bowlers.push(...additionalBowlers);
    }

    return bowlers.slice(0, Math.max(3, Math.min(6, bowlers.length))); // At least 3, max 6 bowlers
}

// Apply bowling variations based on bowler style and batsman type
function applyBowlingVariation(bowler, batsman, baseOutProb) {
    if (!bowler.bowlingStyle) return baseOutProb; // No variation if not specified

    let variationModifier = 1;
    const isBatsmanAggressive = batsman.batting >= 80;

    // Determine which variation is being bowled (50/50 chance of strong or weak)
    const useStrongVariation = Math.random() > 0.5;
    const variation = useStrongVariation ? bowler.strongVariation : bowler.weakVariation;

    // Fast bowlers vs aggressive batsmen
    if (bowler.bowlingStyle === 'fastBowler') {
        if (variation === 'yorker') {
            // Yorkers are very effective against aggressive batsmen
            variationModifier = isBatsmanAggressive ? 1.35 : 1.15;
        } else if (variation === 'shortPitch') {
            // Short pitch bowling is risky but can work
            variationModifier = isBatsmanAggressive ? 0.85 : 1.25;
        } else if (variation === 'bouncer') {
            // Bouncers against aggressive batsmen
            variationModifier = isBatsmanAggressive ? 1.40 : 1.10;
        } else if (variation === 'inswinger') {
            variationModifier = 1.25;
        } else if (variation === 'outswinger') {
            variationModifier = 1.20;
        } else if (variation === 'longPitch' || variation === 'fullLength') {
            variationModifier = 0.90; // Weak variation
        }
    }
    // Leg spinners (googly, leg break, flipper)
    else if (bowler.bowlingStyle === 'legSpinner') {
        if (variation === 'googly') {
            // Googly is deceptive
            variationModifier = 1.30;
        } else if (variation === 'legBreak') {
            variationModifier = 1.15;
        } else if (variation === 'flipper') {
            variationModifier = 1.25;
        } else {
            variationModifier = 0.95; // Weak variation
        }
    }
    // Off spinners (off break, arm ball)
    else if (bowler.bowlingStyle === 'offSpinner') {
        if (variation === 'offBreak') {
            variationModifier = 1.20;
        } else if (variation === 'armBall') {
            variationModifier = 1.25;
        } else {
            variationModifier = 0.95;
        }
    }
    // Left-arm spinners (doosra, arm ball, carrom)
    else if (bowler.bowlingStyle === 'leftArmSpinner') {
        if (variation === 'doosra') {
            variationModifier = 1.28;
        } else if (variation === 'armBall') {
            variationModifier = 1.22;
        } else if (variation === 'carrom') {
            variationModifier = 1.18;
        } else {
            variationModifier = 0.92;
        }
    }

    // Apply left-hand vs right-hand advantage
    const bowlerLeftArm = bowler.bowlingStyle === 'leftArmSpinner';
    const batsmanLeftHanded = batsman.name && (
        batsman.name.includes('Rohit') || batsman.name.includes('Klax') ||
        batsman.name.includes('David') || batsman.name.includes('Shane') ||
        batsman.name.includes('Mitchell Marsh')
    );

    if (bowlerLeftArm && batsmanLeftHanded) {
        variationModifier *= 0.85; // Left-arm bowler advantage diminished against left-hander
    } else if (bowlerLeftArm) {
        variationModifier *= 1.10; // Left-arm bowler has advantage against right-handers
    }

    return baseOutProb * variationModifier;
}

// Calculate ball outcome based on player skills
function calculateBallOutcome(batsman, bowler) {
    const battingSkill = batsman.batting;
    const bowlingSkill = bowler.bowling;

    // Format-based scoring rates (reduced by 8%)
    let outProb, boundaryProb, dotProb, run1Prob, run2Prob, run3Prob;
    if (currentMatchType === 'test') {
        outProb = 0.844 * Math.max(0.02, Math.min(0.15, (bowlingSkill - battingSkill + 30) / 320));
        outProb *= 0.7; // Reduce wicket probability by 30%
        boundaryProb = 0.92 * Math.max(0.03, (battingSkill - 60) / 180);
        dotProb = 0.92 * Math.max(0.25, (bowlingSkill - battingSkill + 40) / 90);
        run1Prob = 0.92 * 0.60;
        run2Prob = 0.92 * 0.20;
        run3Prob = 0.92 * 0.10;
    } else if (currentMatchType === 'odi') {
        outProb = Math.max(0.015, Math.min(0.15, (bowlingSkill - battingSkill + 30) / 340));
        outProb *= 0.7764678; // Reduce wicket probability by 22.3532%
        boundaryProb = 0.92 * Math.max(0.045, (battingSkill - 55) / 140);
        dotProb = 0.92 * Math.max(0.18, (bowlingSkill - battingSkill + 30) / 100);
        run1Prob = 0.92 * 0.50;
        run2Prob = 0.92 * 0.25;
        run3Prob = 0.92 * 0.17;
    } else {
        outProb = Math.max(0.012, Math.min(0.15, (bowlingSkill - battingSkill + 30) / 370));
        boundaryProb = 0.92 * Math.max(0.06, (battingSkill - 50) / 100);
        dotProb = 0.92 * Math.max(0.13, (bowlingSkill - battingSkill + 20) / 110);
        run1Prob = 0.92 * 0.45;
        run2Prob = 0.92 * 0.25;
        run3Prob = 0.92 * 0.20;
    }

    // Adjust outProb based on batsman skill (Make tail-enders easier to dismiss and top-order harder)
    if (battingSkill >= 85) {
        outProb *= 0.65; // Elite top order
    } else if (battingSkill >= 75) {
        outProb *= 0.8; // Good top order
    } else if (battingSkill < 55) {
        outProb *= 2.5; // Pure bowlers / tail-enders
    } else if (battingSkill < 65) {
        outProb *= 1.6; // Lower order
    }

    // Apply bowling variations to modify wicket probability
    outProb = applyBowlingVariation(bowler, batsman, outProb);

    const rand = Math.random();
    if (rand < outProb) return 'out';
    if (rand < outProb + boundaryProb) {
        return Math.random() < 0.8 ? '4' : '6';
    }
    if (rand < outProb + boundaryProb + dotProb) return '0';
    // Other outcomes
    const rand2 = Math.random();
    if (rand2 < run1Prob) return '1';
    if (rand2 < run1Prob + run2Prob) return '2';
    if (rand2 < run1Prob + run2Prob + run3Prob) return '3';
    if (rand2 < run1Prob + run2Prob + run3Prob + 0.05) return 'wide';
    return 'noball';
}

// Generate an AI-style post-match narrative from innings data
function generateMatchNarrative(matchData) {
    const { firstBatName, secondBatName, firstInnings, secondInnings, winner } = matchData;
    const format = matchData.format || currentMatchType || 't20';

    // Find top scorer
    const allBatting = [...(firstInnings.batting || []), ...(secondInnings.batting || [])];
    const topScorer = allBatting.filter(p => p.runs > 0).sort((a, b) => b.runs - a.runs)[0];

    // Find top wicket-taker
    const allBowling = [...(firstInnings.bowling || []), ...(secondInnings.bowling || [])];
    const topBowler = allBowling.filter(p => p.wickets > 0).sort((a, b) => b.wickets - a.wickets)[0];

    // Find key partnership or collapse moment
    const scoreDiff = Math.abs(firstInnings.total - secondInnings.total);
    const chaserCollapse = secondInnings.wickets >= 8 && secondInnings.total < firstInnings.total;
    const closeChase = secondInnings.total > 0 && scoreDiff < 15 && winner !== firstBatName;
    const dominantWin = scoreDiff > 50;

    // Sentence 1: Set the scene with the top scorer
    let s1 = '';
    if (topScorer) {
        const team = firstInnings.batting.find(p => p.name === topScorer.name) ? firstBatName : secondBatName;
        const adj = topScorer.runs >= 100 ? 'century' : topScorer.runs >= 50 ? 'half-century' : 'knock';
        const sr = topScorer.balls > 0 ? ((topScorer.runs / topScorer.balls) * 100).toFixed(0) : 0;
        const qualifiers = ['brilliant', 'gutsy', 'composed', 'explosive', 'magnificent', 'stellar'];
        const q = qualifiers[Math.floor(Math.random() * qualifiers.length)];
        s1 = `${topScorer.name} anchored ${team}'s innings with a ${q} ${adj} of ${topScorer.runs} off ${topScorer.balls} balls (SR: ${sr}).`;
    } else {
        s1 = `${firstBatName} set the tone with a total of ${firstInnings.total}/${firstInnings.wickets} in ${firstInnings.overs} overs.`;
    }

    // Sentence 2: Key bowling performance or turning point
    let s2 = '';
    if (topBowler) {
        const bowlerTeam = secondInnings.bowling.find(p => p.name === topBowler.name) ? secondBatName : firstBatName;
        const phrases = [
            `${topBowler.name} was the pick of the bowlers for ${bowlerTeam}, finishing with ${topBowler.wickets}/${topBowler.runs}.`,
            `${topBowler.name} turned the match on its head for ${bowlerTeam} with a devastating spell of ${topBowler.wickets}/${topBowler.runs}.`,
            `It was ${topBowler.name}'s ${topBowler.wickets}-wicket haul for ${bowlerTeam} that proved decisive.`
        ];
        s2 = phrases[Math.floor(Math.random() * phrases.length)];
    } else if (chaserCollapse) {
        s2 = `${secondBatName}'s batting lineup crumbled under pressure, losing ${secondInnings.wickets} wickets in the chase.`;
    } else {
        s2 = `The ${format.toUpperCase()} clash saw both sides trade blows throughout, with ${secondBatName} posting ${secondInnings.total}/${secondInnings.wickets}.`;
    }

    // Sentence 3: Result context
    let s3 = '';
    if (winner === 'Draw' || winner === 'Tie') {
        s3 = `In the end, neither side could separate themselves, as the match ended in a ${winner.toLowerCase()} — a result both camps will reflect on.`;
    } else if (closeChase) {
        s3 = `In a nail-biting finish, ${winner} edged home by just ${scoreDiff} run${scoreDiff !== 1 ? 's' : ''} in what was a truly memorable contest.`;
    } else if (dominantWin) {
        s3 = `${winner} ultimately proved too strong, claiming a commanding victory that underlined their quality.`;
    } else {
        const margins = [
            `${winner} held their nerve to seal the win`,
            `${winner} claimed the spoils`,
            `${winner} emerged victorious`
        ];
        const m = margins[Math.floor(Math.random() * margins.length)];
        s3 = `${m} in a contest that kept fans on the edge of their seats until the very end.`;
    }

    return `<div class="match-narrative"><p>${s1}</p><p>${s2}</p><p>${s3}</p></div>`;
}

// Display match results
function displayResults() {
    const resultsSection = document.getElementById('match-results');
    const summaryDiv = document.getElementById('result-summary');

    // Create summary
    let summaryHTML = `
        <h3>${matchResults.team1.name} vs ${matchResults.team2.name} - ${currentMatchType.toUpperCase()}</h3>
        <p><strong>Toss:</strong> ${matchResults.tossWinner} won the toss and chose to ${matchResults.tossDecision === 'bat' ? 'bat first' : 'bowl first'}</p>
    `;

    if (currentMatchType === 'test') {
        // Test match summary with both innings
        const team1Total = matchResults.team1.innings[0].total + matchResults.team1.innings[1].total;
        const team2Total = matchResults.team2.innings[0].total + matchResults.team2.innings[1].total;

        summaryHTML += `
            <p><strong>${matchResults.team1.name} 1st Innings:</strong> ${matchResults.team1.innings[0].total}/${matchResults.team1.innings[0].wickets} (${matchResults.team1.innings[0].overs} overs)</p>
            <p><strong>${matchResults.team2.name} 1st Innings:</strong> ${matchResults.team2.innings[0].total}/${matchResults.team2.innings[0].wickets} (${matchResults.team2.innings[0].overs} overs)</p>
        `;
        // Lead after 1st innings
        const lead1 = matchResults.team1.innings[0].total - matchResults.team2.innings[0].total;
        if (lead1 > 0) {
            summaryHTML += `<p><em>${matchResults.team1.name} lead by ${lead1} run(s) after 1st innings</em></p>`;
        } else if (lead1 < 0) {
            summaryHTML += `<p><em>${matchResults.team2.name} lead by ${-lead1} run(s) after 1st innings</em></p>`;
        } else {
            summaryHTML += `<p><em>Scores level after 1st innings</em></p>`;
        }
        summaryHTML += `
            <p><strong>${matchResults.team1.name} 2nd Innings:</strong> ${matchResults.team1.innings[1].total}/${matchResults.team1.innings[1].wickets} (${matchResults.team1.innings[1].overs} overs)</p>
            <p><strong>${matchResults.team2.name} 2nd Innings:</strong> ${matchResults.team2.innings[1].total}/${matchResults.team2.innings[1].wickets} (${matchResults.team2.innings[1].overs} overs)</p>
        `;
        // Lead after 3rd innings
        const lead2 = (matchResults.team1.innings[0].total + matchResults.team1.innings[1].total) - (matchResults.team2.innings[0].total);
        if (lead2 > 0) {
            summaryHTML += `<p><em>${matchResults.team1.name} lead by ${lead2} run(s) after 3rd innings</em></p>`;
        } else if (lead2 < 0) {
            summaryHTML += `<p><em>${matchResults.team2.name} lead by ${-lead2} run(s) after 3rd innings</em></p>`;
        } else {
            summaryHTML += `<p><em>Scores level after 3rd innings</em></p>`;
        }
        summaryHTML += `
            <p><strong>Final Score:</strong> ${matchResults.team1.name} ${team1Total} - ${matchResults.team2.name} ${team2Total}</p>
            <p><strong>Result:</strong> ${matchResults.winner} ${matchResults.resultType === 'runs' ? `won by ${matchResults.margin} runs` : matchResults.resultType === 'wickets' ? `won by ${10 - matchResults.team2.innings[1].wickets} wickets` : matchResults.resultType === 'draw' ? 'match drawn' : 'won'}</p>
        `;
    } else {
        // Limited overs summary
        summaryHTML += `
            <p><strong>${matchResults.team1.name}:</strong> ${matchResults.team1.innings[0].total}/${matchResults.team1.innings[0].wickets} (${matchResults.team1.innings[0].overs} overs)</p>
            <p><strong>${matchResults.team2.name}:</strong> ${matchResults.team2.innings[0].total}/${matchResults.team2.innings[0].wickets} (${matchResults.team2.innings[0].overs} overs)</p>
            <p><strong>Result:</strong> ${matchResults.winner} ${matchResults.resultType === 'runs' ? `won by ${matchResults.margin} runs` : matchResults.resultType === 'wickets' ? `won by ${10 - matchResults.team2.innings[0].wickets} wickets` : 'won'}</p>
        `;
    }

    summaryDiv.innerHTML = summaryHTML;

    // Generate and inject AI match narrative
    const firstInnings = currentMatchType === 'test'
        ? matchResults.team1.innings[0]
        : matchResults.team1.innings[0];
    const secondInnings = currentMatchType === 'test'
        ? matchResults.team2.innings[0]
        : matchResults.team2.innings[0];

    const narrativeData = {
        firstBatName: matchResults.team1.name,
        secondBatName: matchResults.team2.name,
        firstInnings: firstInnings,
        secondInnings: secondInnings,
        winner: matchResults.winner,
        format: currentMatchType
    };
    const narrativeHTML = generateMatchNarrative(narrativeData);
    // Insert narrative between summary and scorecards
    summaryDiv.innerHTML += narrativeHTML;

    // Create scorecards based on match type
    if (currentMatchType === 'test') {
        // Test match: show separate scorecards for each innings with toggle buttons
        createTestMatchScorecards();
    } else {
        // Limited overs: show single innings
        createBattingScorecard('team1-batting-scorecard', matchResults.team1.name, matchResults.team1.innings[0].batting);
        createBattingScorecard('team2-batting-scorecard', matchResults.team2.name, matchResults.team2.innings[0].batting);

        createBowlingScorecard('team1-bowling-scorecard', matchResults.team2.name, matchResults.team2.innings[0].bowling);
        createBowlingScorecard('team2-bowling-scorecard', matchResults.team1.name, matchResults.team1.innings[0].bowling);
    }

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Create separate scorecards for test matches with toggle buttons
function createTestMatchScorecards() {
    const scorecardsContainer = document.querySelector('.scorecards');

    // Clear existing scorecards
    scorecardsContainer.innerHTML = '';

    // Create innings toggle buttons
    const toggleSection = document.createElement('div');
    toggleSection.className = 'innings-toggle';
    toggleSection.innerHTML = `
        <h3>Innings Scorecards</h3>
        <div class="toggle-buttons">
            <button class="toggle-btn active" onclick="showInningsScorecard('first')">1st Innings</button>
            <button class="toggle-btn" onclick="showInningsScorecard('second')">2nd Innings</button>
        </div>
    `;
    scorecardsContainer.appendChild(toggleSection);

    // Create scorecard containers
    const scorecardSection = document.createElement('div');
    scorecardSection.className = 'scorecard-section';
    scorecardSection.innerHTML = `
        <div class="scorecard-container">
            <div id="team1-batting-scorecard"></div>
            <div id="team2-batting-scorecard"></div>
        </div>
        <div class="scorecard-container">
            <div id="team1-bowling-scorecard"></div>
            <div id="team2-bowling-scorecard"></div>
        </div>
    `;
    scorecardsContainer.appendChild(scorecardSection);

    // Show first innings by default
    showInningsScorecard('first');
}

// Show specific innings scorecard
function showInningsScorecard(innings) {
    // Update toggle button states
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (innings === 'first') {
        document.querySelector('.toggle-btn:first-child').classList.add('active');

        // Show first innings scorecards
        createBattingScorecard('team1-batting-scorecard', matchResults.team1.name, matchResults.team1.innings[0].batting);
        createBattingScorecard('team2-batting-scorecard', matchResults.team2.name, matchResults.team2.innings[0].batting);

        createBowlingScorecard('team1-bowling-scorecard', matchResults.team2.name, matchResults.team2.innings[0].bowling);
        createBowlingScorecard('team2-bowling-scorecard', matchResults.team1.name, matchResults.team1.innings[0].bowling);
    } else {
        document.querySelector('.toggle-btn:last-child').classList.add('active');

        // Show second innings scorecards
        createBattingScorecard('team1-batting-scorecard', matchResults.team1.name, matchResults.team1.innings[1].batting);
        createBattingScorecard('team2-batting-scorecard', matchResults.team2.name, matchResults.team2.innings[1].batting);

        createBowlingScorecard('team1-bowling-scorecard', matchResults.team2.name, matchResults.team2.innings[1].bowling);
        createBowlingScorecard('team2-bowling-scorecard', matchResults.team1.name, matchResults.team1.innings[1].bowling);
    }
}

// Combine batting stats from multiple innings
function combineInningsBatting(innings) {
    const combined = {};

    innings.forEach(inningsData => {
        inningsData.batting.forEach(player => {
            if (!combined[player.name]) {
                combined[player.name] = {
                    name: player.name,
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0,
                    dismissal: null
                };
            }

            combined[player.name].runs += player.runs;
            combined[player.name].balls += player.balls;
            combined[player.name].fours += player.fours;
            combined[player.name].sixes += player.sixes;

            // Keep the last dismissal
            if (player.dismissal) {
                combined[player.name].dismissal = player.dismissal;
            }
        });
    });

    return Object.values(combined);
}

// Combine bowling stats from multiple innings
function combineInningsBowling(innings) {
    const combined = {};

    innings.forEach(inningsData => {
        inningsData.bowling.forEach(player => {
            if (!combined[player.name]) {
                combined[player.name] = {
                    name: player.name,
                    overs: 0,
                    maidens: 0,
                    runs: 0,
                    wickets: 0,
                    economy: 0
                };
            }

            combined[player.name].overs += parseFloat(player.overs) || 0;
            combined[player.name].maidens += player.maidens;
            combined[player.name].runs += player.runs;
            combined[player.name].wickets += player.wickets;
        });
    });

    // Calculate economy rates
    Object.values(combined).forEach(bowler => {
        if (bowler.overs > 0) {
            bowler.economy = (bowler.runs / bowler.overs).toFixed(2);
        }
    });

    return Object.values(combined);
}

// Create batting scorecard
function createBattingScorecard(containerId, teamName, batting) {
    const container = document.getElementById(containerId);

    let html = `
        <div class="scorecard">
            <h4>${teamName}</h4>
            <table class="scorecard-table">
                <thead>
                    <tr>
                        <th>Batsman</th>
                        <th>R</th>
                        <th>B</th>
                        <th>4s</th>
                        <th>6s</th>
                        <th>SR</th>
                        <th>Dismissal</th>
                    </tr>
                </thead>
                <tbody>
    `;

    batting.forEach(player => {
        const strikeRate = player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(1) : '0.0';
        const dismissal = player.dismissal || 'not out';

        html += `
            <tr>
                <td>${player.name}</td>
                <td>${player.runs}</td>
                <td>${player.balls}</td>
                <td>${player.fours}</td>
                <td>${player.sixes}</td>
                <td>${strikeRate}</td>
                <td>${dismissal}</td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Create bowling scorecard
function createBowlingScorecard(containerId, teamName, bowling) {
    const container = document.getElementById(containerId);
    let isT20 = currentMatchType === 't20';
    let html = `
        <div class="scorecard">
            <h4>${teamName}</h4>
            <table class="scorecard-table">
                <thead>
                    <tr>
                        <th>Bowler</th>
                        <th>O</th>
                        <th>M</th>
                        <th>R</th>
                        <th>W</th>
                        <th>ECO</th>
                    </tr>
                </thead>
                <tbody>
    `;
    let capReached = false;
    bowling.forEach(player => {
        let capped = isT20 && parseFloat(player.overs) >= 4;
        if (capped) capReached = true;
        // Calculate overs as balls/6 (e.g., 22 balls = 3.4 overs)
        let balls = 0;
        if (typeof player.overs === 'number') {
            // Already in balls
            balls = player.overs * 6;
        } else if (typeof player.overs === 'string' && player.overs.includes('.')) {
            const [o, b] = player.overs.split('.').map(Number);
            balls = o * 6 + b;
        } else {
            balls = parseInt(player.overs) * 6;
        }
        // If player.balls exists, use that (for more accuracy)
        if (player.balls !== undefined) balls = player.balls;
        let oversDisplay = Math.floor(balls / 6) + "." + (balls % 6);
        html += `
            <tr>
                <td>${player.name}${capped ? ' *' : ''}</td>
                <td>${oversDisplay}</td>
                <td>${player.maidens}</td>
                <td>${player.runs}</td>
                <td>${player.wickets}</td>
                <td>${player.economy}</td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    if (isT20 && capReached) {
        html += `<div style='font-size:0.95em;margin-top:4px;'>* Bowler reached T20 4-over cap</div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

// Reset match
function resetMatch() {
    team1Data = null;
    team2Data = null;
    matchResults = null;
    tossWinner = null;
    tossDecision = null;
    team1Venue = null;

    document.getElementById('team1').value = '';
    document.getElementById('team2').value = '';
    document.getElementById('team1-name').textContent = 'Team 1';
    document.getElementById('team2-name').textContent = 'Team 2';

    // Reset venue selections
    document.getElementById('team1-home-venue').value = '';
    document.getElementById('team1-neutral-venue').value = '';
    document.getElementById('team1-venue-info').innerHTML = '';

    document.getElementById('team1-batting').innerHTML = '';
    document.getElementById('team1-bowling').innerHTML = '';
    document.getElementById('team2-batting').innerHTML = '';
    document.getElementById('team2-bowling').innerHTML = '';

    document.getElementById('match-results').style.display = 'none';
    document.getElementById('toss-section').style.display = 'none';
}

// --- Tournament Logic ---

let tournamentState = null;

function showPanel(panel) {
    document.getElementById('single-panel').style.display = panel === 'single' ? 'block' : 'none';
    const leaguePanel = document.getElementById('league-panel'); if (leaguePanel) leaguePanel.style.display = panel === 'league' ? 'block' : 'none';
    document.getElementById('tournament-panel').style.display = panel === 'tournament' ? 'block' : 'none';
    document.getElementById('tours-panel').style.display = panel === 'tours' ? 'block' : 'none';
    document.getElementById('single-tab').classList.toggle('active', panel === 'single');
    const leagueTab = document.getElementById('league-tab'); if (leagueTab) leagueTab.classList.toggle('active', panel === 'league');
    document.getElementById('tournament-tab').classList.toggle('active', panel === 'tournament');
    document.getElementById('tours-tab').classList.toggle('active', panel === 'tours');
    if (panel === 'tournament') {
        renderTournamentTeamSelectors();
    }
}

function renderTournamentTeamSelectors() {
    const sizeInput = document.querySelector('input[name="tournament-size"]:checked');
    const size = sizeInput.value;
    const selectorDiv = document.getElementById('tournament-team-selectors');
    selectorDiv.innerHTML = '';
    const presetEl = document.getElementById('league-preset');
    const preset = presetEl ? presetEl.value : 'custom';
    const presetKeys = (typeof getLeagueTeamKeys === 'function') ? getLeagueTeamKeys(preset) : null;
    const teamKeys = [
        'india', 'australia', 'england', 'southafrica', 'newzealand', 'pakistan', 'srilanka', 'bangladesh', 'westindies', 'afghanistan',
        'rcb', 'csk', 'mi', 'gt', 'lsg', 'dc', 'srh', 'pbks', 'rr', 'kkr',
        'brisbane_heat', 'sydney_thunder', 'melbourne_stars', 'perth_scorchers', 'sydney_sixers', 'melbourne_renegades', 'adelaide_strikers', 'hobart_hurricanes',
        'southern_brave', 'northern_superchargers', 'welsh_fire', 'london_spirit', 'oval_invincibles', 'manchester_originals', 'birmingham_phoenix', 'trent_rockets',
        'antigua_barbuda_falcons', 'trinbago_knight_riders', 'guyana_amazon_warriors', 'barbados_royals', 'saint_lucia_kings', 'st_kitts_nevis_patriots',
        'hyderabad_kingsmen', 'islamabad_united', 'karachi_kings', 'lahore_qalandars', 'multan_sultans', 'peshawar_zalmi', 'quetta_gladiators', 'rawalpindi_pindiz'
    ];
    const availableKeys = presetKeys ? teamKeys.filter(k => presetKeys.includes(k)) : teamKeys;

    // Define labels based on tournament size
    let labels = [];
    let actualSize = 0;

    if (size === 'ipl4') {
        labels = ['Top 1', 'Top 2', 'Bottom 3', 'Bottom 4'];
        actualSize = 4;
    } else {
        actualSize = parseInt(size);
        for (let i = 0; i < actualSize; i++) {
            labels.push(`Team ${i + 1}`);
        }
    }

    for (let i = 0; i < actualSize; i++) {
        const selDiv = document.createElement('div');
        selDiv.className = 'tournament-team-selector';
        const label = document.createElement('label');
        label.textContent = labels[i];
        const select = document.createElement('select');
        select.id = `tournament-team-${i}`;
        select.onchange = () => preventDuplicateTournamentTeams();
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = 'Select Team';
        select.appendChild(defaultOpt);

        if (!presetKeys) {
            // Add categorized groups in custom mode
            const internationalOptgroup = document.createElement('optgroup');
            internationalOptgroup.label = 'International Teams';
            const iplOptgroup = document.createElement('optgroup');
            iplOptgroup.label = 'IPL Teams';
            const bblOptgroup = document.createElement('optgroup');
            bblOptgroup.label = 'BBL Teams';
            const hundredOptgroup = document.createElement('optgroup');
            hundredOptgroup.label = 'The Hundred Teams';
            const cplOptgroup = document.createElement('optgroup');
            cplOptgroup.label = 'CPL Teams';
            const pslOptgroup = document.createElement('optgroup');
            pslOptgroup.label = 'PSL Teams';

            availableKeys.forEach(key => {
                const opt = document.createElement('option');
                opt.value = key;
                opt.textContent = teams[key].name;
                if (['india', 'australia', 'england', 'southafrica', 'newzealand', 'pakistan', 'srilanka', 'bangladesh', 'westindies', 'afghanistan'].includes(key)) {
                    internationalOptgroup.appendChild(opt);
                } else if (['rcb', 'csk', 'mi', 'gt', 'lsg', 'dc', 'srh', 'pbks', 'rr', 'kkr'].includes(key)) {
                    iplOptgroup.appendChild(opt);
                } else if (['brisbane_heat', 'sydney_thunder', 'melbourne_stars', 'perth_scorchers', 'sydney_sixers', 'melbourne_renegades', 'adelaide_strikers', 'hobart_hurricanes'].includes(key)) {
                    bblOptgroup.appendChild(opt);
                } else if (['antigua_barbuda_falcons', 'trinbago_knight_riders', 'guyana_amazon_warriors', 'barbados_royals', 'saint_lucia_kings', 'st_kitts_nevis_patriots'].includes(key)) {
                    cplOptgroup.appendChild(opt);
                } else if (['hyderabad_kingsmen', 'islamabad_united', 'karachi_kings', 'lahore_qalandars', 'multan_sultans', 'peshawar_zalmi', 'quetta_gladiators', 'rawalpindi_pindiz'].includes(key)) {
                    pslOptgroup.appendChild(opt);
                } else {
                    hundredOptgroup.appendChild(opt);
                }
            });
            select.appendChild(internationalOptgroup);
            select.appendChild(iplOptgroup);
            select.appendChild(bblOptgroup);
            select.appendChild(cplOptgroup);
            select.appendChild(pslOptgroup);
            select.appendChild(hundredOptgroup);
        } else {
            // Flat list for preset leagues
            availableKeys.forEach(key => {
                const opt = document.createElement('option');
                opt.value = key;
                opt.textContent = teams[key].name;
                select.appendChild(opt);
            });
        }
        selDiv.appendChild(label);
        selDiv.appendChild(select);
        selectorDiv.appendChild(selDiv);
    }
}

function preventDuplicateTournamentTeams() {
    const sizeInput = document.querySelector('input[name="tournament-size"]:checked'); const size = sizeInput.value; const actualSize = size === 'ipl4' ? 4 : parseInt(size);
    const selected = [];
    for (let i = 0; i < actualSize; i++) {
        const val = document.getElementById(`tournament-team-${i}`).value;
        if (val) selected.push(val);
    }
    for (let i = 0; i < actualSize; i++) {
        const select = document.getElementById(`tournament-team-${i}`);
        for (let j = 0; j < select.options.length; j++) {
            const opt = select.options[j];
            if (opt.value && selected.includes(opt.value) && select.value !== opt.value) {
                opt.disabled = true;
            } else {
                opt.disabled = false;
            }
        }
    }
}

function startTournament() {
    const sizeInput = document.querySelector('input[name="tournament-size"]:checked');
    const size = sizeInput.value;
    const actualSize = size === 'ipl4' ? 4 : parseInt(size);
    // Get selected format
    const format = document.querySelector('input[name="tournament-format"]:checked').value;
    const selectedTeams = [];
    for (let i = 0; i < actualSize; i++) {
        const val = document.getElementById(`tournament-team-${i}`).value;
        if (!val) {
            alert('Please select all teams for the tournament!');
            return;
        }
        selectedTeams.push(val);
    }
    // Shuffle teams for random bracket
    const shuffled = selectedTeams.slice().sort(() => Math.random() - 0.5);
    tournamentState = {
        size: actualSize,
        teams: shuffled,
        round: 0,
        matches: [],
        results: [],
        winner: null,
        matchData: {}, // Store full match data for scorecard
        format, // Store selected format
        iplPlayoffFormat: size === 'ipl4', // Store if this is IPL playoff format
        triSeriesFormat: size === '3' // Store if this is Tri-Series format
    };
    document.getElementById('tournament-bracket-section').style.display = 'block';
    renderTournamentBracket();
}

function renderTournamentBracket() {
    const bracketDiv = document.getElementById('tournament-bracket');
    const resultsDiv = document.getElementById('tournament-results');
    bracketDiv.innerHTML = '';
    resultsDiv.innerHTML = '';
    if (!tournamentState) return;

    // Check if this is IPL playoffs format
    if (tournamentState.iplPlayoffFormat) {
        renderIPLPlayoffBracket();
        return;
    }

    // Check if this is Tri-Series format
    if (tournamentState.triSeriesFormat) {
        renderTriSeriesBracket();
        return;
    }

    // Standard knockout tournament format
    const rounds = Math.log2(tournamentState.size);
    let currentTeams = tournamentState.teams.slice();
    let roundWinners = [];
    let matchIdx = 0;
    for (let r = 0; r < rounds; r++) {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'bracket-round';
        roundDiv.style.display = 'flex';
        roundDiv.style.flexDirection = 'column';
        roundDiv.style.gap = '20px';

        const roundMatches = [];
        for (let i = 0; i < currentTeams.length; i += 2) {
            const teamA = teams[currentTeams[i]].name;
            const teamB = teams[currentTeams[i + 1]].name;
            const matchDiv = document.createElement('div');
            matchDiv.className = 'bracket-match';
            matchDiv.style.cssText = 'background: #fff8e1; border-radius: 10px; padding: 20px; border: 1.5px solid #ffe0b2; text-align: center; min-height: 200px;';
            let matchResult = tournamentState.results[matchIdx];
            let matchData = tournamentState.matchData ? tournamentState.matchData[matchIdx] : null;
            if (matchResult && matchData) {
                matchDiv.classList.add('bracket-winner');
                // Show scores for both teams next to their names, and a separate scorecard button
                let teamAScore = `${matchData.firstInnings.total}/${matchData.firstInnings.wickets} (${matchData.firstInnings.overs} ov)`;
                let teamBScore = `${matchData.secondInnings.total}/${matchData.secondInnings.wickets} (${matchData.secondInnings.overs} ov)`;
                let winnerText = matchResult;
                let resultDetails = '';

                if (matchData.superOver) {
                    winnerText += ' (Super Over)';
                    resultDetails = `<div style='font-size:0.9rem;color:#e65100;margin-top:4px;'>⚡ Both teams all out with equal scores → Super Over</div>`;
                } else if (matchData.firstInnings.total === matchData.secondInnings.total) {
                    // This shouldn't happen anymore, but just in case
                    resultDetails = `<div style='font-size:0.9rem;color:#e65100;margin-top:4px;'>⚡ Equal scores - both teams all out</div>`;
                } else if (matchData.secondInnings.total > matchData.firstInnings.total) {
                    resultDetails = `<div style='font-size:0.9rem;color:#4caf50;margin-top:4px;'>✅ Chasing team crossed target</div>`;
                } else {
                    resultDetails = `<div style='font-size:0.9rem;color:#f44336;margin-top:4px;'>❌ Chasing team all out before crossing target</div>`;
                }

                matchDiv.innerHTML = `<span>${matchData.firstBatName} <span style='color:#4f46e5;font-weight:600;'>${teamAScore}</span> vs ${matchData.secondBatName} <span style='color:#4f46e5;font-weight:600;'>${teamBScore}</span></span><br><strong>Winner: <span style='color:#ff9800;cursor:pointer;text-decoration:underline;' onclick='showTournamentScorecard(${matchIdx})'>${winnerText}</span></strong>${resultDetails}<br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;background:#667eea;' onclick='showTournamentScorecard(${matchIdx})'>View Scorecard</button>`;

                // Determine which team key corresponds to the winner
                let winnerTeamKey;
                if (matchResult === matchData.firstBatName) {
                    winnerTeamKey = matchData.firstBatKey;
                } else if (matchResult === matchData.secondBatName) {
                    winnerTeamKey = matchData.secondBatKey;
                } else {
                    // Fallback: determine based on original bracket teams
                    winnerTeamKey = matchResult === teams[currentTeams[i]].name ? currentTeams[i] : currentTeams[i + 1];
                }
                roundWinners.push(winnerTeamKey);
            } else {
                matchDiv.innerHTML = `<span>${teamA} vs ${teamB}</span><br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;' onclick='simulateTournamentMatch(${matchIdx},"${currentTeams[i]}","${currentTeams[i + 1]}")'>Simulate</button>`;
            }
            roundDiv.appendChild(matchDiv);
            roundMatches.push([currentTeams[i], currentTeams[i + 1]]);
            matchIdx++;
        }
        bracketDiv.appendChild(roundDiv);

        currentTeams = roundWinners.slice();
        roundWinners = [];
    }
    if (tournamentState.winner) {
        resultsDiv.innerHTML = `<div class='bracket-match bracket-winner' style='font-size:1.2rem;'>🏆 Champion: ${teams[tournamentState.winner].name} 🏆</div>`;
    }
}

function simulateTournamentMatch(matchIdx, teamAKey, teamBKey) {
    // For IPL playoffs, determine teams based on match index and previous results
    let actualTeamAKey, actualTeamBKey;

    if (tournamentState.iplPlayoffFormat) {
        if (matchIdx === 0) {
            // Qualifier 1: Top 1 vs Top 2
            actualTeamAKey = tournamentState.teams[0];
            actualTeamBKey = tournamentState.teams[1];
        } else if (matchIdx === 1) {
            // Eliminator: Bottom 3 vs Bottom 4
            actualTeamAKey = tournamentState.teams[2];
            actualTeamBKey = tournamentState.teams[3];
        } else if (matchIdx === 2) {
            // Qualifier 2: Loser Q1 vs Winner Eliminator
            const q1Winner = tournamentState.results[0];
            const eliminatorWinner = tournamentState.results[1];
            const q1Data = tournamentState.matchData[0];

            // Loser of Q1
            const q1Loser = q1Data.firstBatName === q1Winner ? q1Data.secondBatName : q1Data.firstBatName;
            const q1LoserKey = q1Data.firstBatName === q1Winner ? q1Data.secondBatKey : q1Data.firstBatKey;

            // Winner of Eliminator
            const eliminatorData = tournamentState.matchData[1];
            const eliminatorWinnerKey = eliminatorData.firstBatName === eliminatorWinner ? eliminatorData.firstBatKey : eliminatorData.secondBatKey;

            actualTeamAKey = q1LoserKey;
            actualTeamBKey = eliminatorWinnerKey;
        } else if (matchIdx === 3) {
            // Final: Winner Q1 vs Winner Q2
            const q1Winner = tournamentState.results[0];
            const q2Winner = tournamentState.results[2];
            const q1Data = tournamentState.matchData[0];
            const q2Data = tournamentState.matchData[2];

            // Winner of Q1
            const q1WinnerKey = q1Data.firstBatName === q1Winner ? q1Data.firstBatKey : q1Data.secondBatKey;

            // Winner of Q2
            const q2WinnerKey = q2Data.firstBatName === q2Winner ? q2Data.firstBatKey : q2Data.secondBatKey;

            actualTeamAKey = q1WinnerKey;
            actualTeamBKey = q2WinnerKey;
        }
    } else {
        // Standard tournament format
        actualTeamAKey = teamAKey;
        actualTeamBKey = teamBKey;
    }

    // Simulate a single match between teamA and teamB using the selected format
    const teamA = teams[actualTeamAKey];
    const teamB = teams[actualTeamBKey];
    // Use best 11 for both
    const teamA11 = getBestEleven(teamA.players);
    const teamB11 = getBestEleven(teamB.players);
    // Random toss
    const tossWinner = Math.random() < 0.5 ? teamA : teamB;
    const tossDecision = Math.random() < 0.5 ? 'bat' : 'bowl';
    let firstBat, secondBat, firstKey, secondKey;
    if (tossDecision === 'bat') {
        firstBat = tossWinner;
        secondBat = tossWinner === teamA ? teamB : teamA;
        firstKey = tossWinner === teamA ? actualTeamAKey : actualTeamBKey;
        secondKey = tossWinner === teamA ? actualTeamBKey : actualTeamAKey;
    } else {
        firstBat = tossWinner === teamA ? teamB : teamA;
        secondBat = tossWinner === teamA ? teamA : teamB;
        firstKey = tossWinner === teamA ? actualTeamBKey : actualTeamAKey;
        secondKey = tossWinner === teamA ? actualTeamAKey : actualTeamBKey;
    }
    // Use selected format
    const format = tournamentState.format || 't20';
    const config = matchConfigs[format];
    const firstInnings = simulateTournamentInningsWithScorecard(firstBat, secondBat, config);
    const secondInnings = simulateTournamentInningsWithScorecard(secondBat, firstBat, config, firstInnings.total);
    let winner;
    if (secondInnings.total > firstInnings.total) {
        // Chasing team has crossed the target - they win
        winner = secondBat.name;
    } else if (firstInnings.total > secondInnings.total) {
        // Chasing team couldn't reach the target - first batting team wins
        winner = firstBat.name;
    } else {
        // Scores are equal - this should only happen if both teams are all out
        // Both teams are all out with same score - this is a genuine tie
        // Tournament mode: No ties allowed - Super Over
        const superOver = simulateSuperOver(firstBat, secondBat);
        winner = superOver.winner;
        // Store full match data for scorecard including Super Over
        if (!tournamentState.matchData) tournamentState.matchData = {};
        tournamentState.matchData[matchIdx] = {
            teamAKey: actualTeamAKey, teamBKey: actualTeamBKey,
            firstBatKey: firstKey, secondBatKey: secondKey,
            firstBatName: firstBat.name, secondBatName: secondBat.name,
            tossWinner: tossWinner.name, tossDecision,
            firstInnings, secondInnings,
            superOver,
            winner,
            format // Store format for scorecard display
        };
        tournamentState.results[matchIdx] = winner;
        // If this was the last match, set champion
        if ((tournamentState.iplPlayoffFormat || tournamentState.triSeriesFormat) && matchIdx === 3) {
            tournamentState.winner = Object.keys(teams).find(k => teams[k].name === winner);
        } else if (!tournamentState.iplPlayoffFormat && !tournamentState.triSeriesFormat) {
            const totalMatches = tournamentState.size - 1;
            if (tournamentState.results.length === totalMatches && !tournamentState.results.includes(undefined)) {
                tournamentState.winner = Object.keys(teams).find(k => teams[k].name === winner);
            }
        }
        renderTournamentBracket();
        return;
    }
    // Store full match data for scorecard
    if (!tournamentState.matchData) tournamentState.matchData = {};
    tournamentState.matchData[matchIdx] = {
        teamAKey: actualTeamAKey, teamBKey: actualTeamBKey,
        firstBatKey: firstKey, secondBatKey: secondKey,
        firstBatName: firstBat.name, secondBatName: secondBat.name,
        tossWinner: tossWinner.name, tossDecision,
        firstInnings, secondInnings,
        winner,
        format // Store format for scorecard display
    };
    tournamentState.results[matchIdx] = winner;
    // If this was the last match, set champion
    if ((tournamentState.iplPlayoffFormat || tournamentState.triSeriesFormat) && matchIdx === 3) {
        tournamentState.winner = Object.keys(teams).find(k => teams[k].name === winner);
    } else if (!tournamentState.iplPlayoffFormat && !tournamentState.triSeriesFormat) {
        const totalMatches = tournamentState.size - 1;
        if (tournamentState.results.length === totalMatches && !tournamentState.results.includes(undefined)) {
            tournamentState.winner = Object.keys(teams).find(k => teams[k].name === winner);
        }
    }
    renderTournamentBracket();
}

function simulateTournamentInningsWithScorecard(battingTeam, bowlingTeam, config, target = null) {
    const battingLineup = getBestEleven(battingTeam.players);
    const bowlingLineup = getBestEleven(bowlingTeam.players).filter(p => p.bowling > 50).slice(0, 6);
    const fieldingLineupFull = getBestEleven(bowlingTeam.players);
    const innings = {
        total: 0,
        wickets: 0,
        overs: 0,
        targetReached: false,
        batting: [],
        bowling: []
    };
    battingLineup.forEach(player => {
        innings.batting.push({
            name: player.name,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            dismissal: null
        });
    });
    let bowlerStats = {};
    bowlingLineup.forEach(player => {
        bowlerStats[player.name] = {
            name: player.name,
            overs: 0,
            balls: 0, // Track balls bowled
            maidens: 0,
            runs: 0,
            wickets: 0,
            economy: 0,
            currentSpellOvers: 0,
            spellLimit: 0
        };
    });

    function getSpellLimit(matchType) {
        if (matchType === 't20') return Math.floor(Math.random() * 2) + 2; // 2 to 3
        if (matchType === 'odi') return Math.floor(Math.random() * 3) + 4; // 4 to 6
        return Math.floor(Math.random() * 4) + 4; // 4 to 7
    }

    let activeBowlers = [0, Math.min(1, bowlingLineup.length - 1)]; // bowlers for two ends
    bowlerStats[bowlingLineup[activeBowlers[0]].name].spellLimit = getSpellLimit(currentMatchType);
    bowlerStats[bowlingLineup[activeBowlers[1]].name].spellLimit = getSpellLimit(currentMatchType);

    let currentBatsman1 = 0;
    let currentBatsman2 = 1;
    let overRuns = 0;
    for (let over = 0; over < config.overs && innings.wickets < config.maxWickets; over++) {
        overRuns = 0;
        let endIdx = over % 2;
        let otherEndIdx = (over + 1) % 2;
        let currentBowler = activeBowlers[endIdx];

        let maxBalls = currentMatchType === 't20' ? 24 : (currentMatchType === 'odi' ? 60 : 9999);
        let bStats = bowlerStats[bowlingLineup[currentBowler].name];

        // Change bowler if max balls reached or spell limit reached
        if (bStats.balls >= maxBalls || bStats.currentSpellOvers >= bStats.spellLimit) {
            let otherBowler = activeBowlers[otherEndIdx];
            let attempts = 0;
            let nextBowler = (currentBowler + 1) % bowlingLineup.length;
            while (attempts < bowlingLineup.length) {
                if (nextBowler !== otherBowler && bowlerStats[bowlingLineup[nextBowler].name].balls < maxBalls) {
                    break;
                }
                nextBowler = (nextBowler + 1) % bowlingLineup.length;
                attempts++;
            }
            currentBowler = nextBowler;
            activeBowlers[endIdx] = currentBowler;

            let newStats = bowlerStats[bowlingLineup[currentBowler].name];
            newStats.currentSpellOvers = 0;
            newStats.spellLimit = getSpellLimit(currentMatchType);
        }

        for (let ball = 0; ball < 6 && innings.wickets < config.maxWickets; ball++) {
            const batsman = battingLineup[currentBatsman1];
            const bowler = bowlingLineup[currentBowler];
            let outcome = calculateBallOutcome(batsman, bowler);

            // Enforce golden duck only rule
            if (outcome === 'out' && innings.batting[currentBatsman1].runs === 0 && innings.batting[currentBatsman1].balls > 0) {
                outcome = '0';
            }

            // Increment balls for legal deliveries
            if (outcome !== 'wide' && outcome !== 'noball') {
                innings.batting[currentBatsman1].balls++;
            }

            let runs = 0;
            if (outcome === 'out') {
                innings.batting[currentBatsman1].dismissal = getRandomDismissal(batsman, bowler, fieldingLineupFull, true);
                innings.wickets++;
                bowlerStats[bowler.name].wickets++;
            } else if (['0', '1', '2', '3', '4', '6'].includes(outcome)) {
                runs = parseInt(outcome);
                // Allow teams to cross the target - don't cap runs
                innings.batting[currentBatsman1].runs += runs;
                if (runs === 4) innings.batting[currentBatsman1].fours++;
                if (runs === 6) innings.batting[currentBatsman1].sixes++;
                innings.total += runs;
                bowlerStats[bowler.name].runs += runs;
                overRuns += runs;
            } else if (outcome === 'wide' || outcome === 'noball') {
                innings.total += 1;
                bowlerStats[bowler.name].runs += 1;
                overRuns += 1;
            }

            // Increment balls for legal deliveries
            if (outcome !== 'wide' && outcome !== 'noball') {
                bowlerStats[bowler.name].balls = (bowlerStats[bowler.name].balls || 0) + 1;
                bowlerStats[bowler.name].overs = ((over * 6 + ball + 1) / 6).toFixed(1);
            }

            addCommentary(innings, over, ball, batsman, bowler, outcome, runs);

            if (outcome === 'out') {
                currentBatsman1 = Math.max(currentBatsman1, currentBatsman2) + 1;
                if (currentBatsman1 >= battingLineup.length) break;
            } else if (['0', '1', '2', '3', '4', '6'].includes(outcome)) {
                if (runs % 2 === 1) {
                    [currentBatsman1, currentBatsman2] = [currentBatsman2, currentBatsman1];
                }
            } else if (outcome === 'wide' || outcome === 'noball') {
                ball--;
                continue; // Don't increment balls for extras
            }

            // In tournament mode, only stop if target is crossed (not just reached)
            if (target && innings.total > target) {
                innings.targetReached = true;
                break;
            }
        }
        if (overRuns === 0) {
            bowlerStats[bowlingLineup[currentBowler].name].maidens++;
        }
        bowlerStats[bowlingLineup[currentBowler].name].currentSpellOvers++;
        innings.overs = over + 1;
        // In tournament mode, only stop if target is crossed (not just reached)
        if (target && innings.total > target) break;
    }
    Object.values(bowlerStats).forEach(bowler => {
        const oversNum = parseFloat(bowler.overs);
        if (oversNum > 0) {
            bowler.economy = (bowler.runs / oversNum).toFixed(2);
        }
    });
    // When copying to innings.bowling, set overs as balls/6 in x.y format
    innings.bowling = Object.values(bowlerStats).filter(b => b.balls > 0).map(b => {
        const overs = Math.floor(b.balls / 6) + "." + (b.balls % 6);
        return { ...b, overs };
    });
    return innings;
}

function showTournamentScorecard(matchIdx) {
    const match = tournamentState.matchData[matchIdx];
    if (!match) return;
    let format = match.format || tournamentState.format || 't20';
    let formatLabel = format.toUpperCase();
    let html = `<div class='scorecard-modal-bg' onclick='closeTournamentScorecard()'></div><div class='scorecard-modal'>`;
    html += `<h3 style='text-align:center;margin-bottom:10px;'>${match.firstBatName} vs ${match.secondBatName} - ${formatLabel}</h3>`;
    html += generateMatchNarrative(match);
    html += `<div style='margin-bottom:8px;text-align:center;font-size:1.05rem;'>Toss: <b>${match.tossWinner}</b> chose to <b>${match.tossDecision === 'bat' ? 'bat first' : 'bowl first'}</b></div>`;
    html += `<div class='scorecard-section'><h4>${match.firstBatName} Batting</h4>` + renderScorecardTable(match.firstInnings.batting, true) + `</div>`;
    html += `<div class='scorecard-section'><h4>${match.secondBatName} Batting</h4>` + renderScorecardTable(match.secondInnings.batting, true) + `</div>`;
    html += `<div class='scorecard-section'><h4>${match.firstBatName} Bowling</h4>` + renderScorecardTable(match.firstInnings.bowling, false) + `</div>`;
    html += `<div class='scorecard-section'><h4>${match.secondBatName} Bowling</h4>` + renderScorecardTable(match.secondInnings.bowling, false) + `</div>`;

    // Add Super Over section if match went to Super Over
    if (match.superOver) {
        html += `<div style='margin-top:20px;padding:15px;background:#fff3e0;border:2px solid #ff9800;border-radius:8px;'>`;
        html += `<h4 style='color:#e65100;text-align:center;margin-bottom:10px;'>🏏 SUPER OVER 🏏</h4>`;
        html += `<div style='margin-bottom:8px;text-align:center;font-size:1.05rem;'>Super Over Toss: <b>${match.superOver.tossWinner}</b> chose to <b>${match.superOver.tossDecision === 'bat' ? 'bat first' : 'bowl first'}</b></div>`;
        html += `<div class='scorecard-section'><h4>${match.superOver.firstBatName} Super Over Batting</h4>` + renderScorecardTable(match.superOver.firstInnings.batting, true) + `</div>`;
        html += `<div class='scorecard-section'><h4>${match.superOver.secondBatName} Super Over Batting</h4>` + renderScorecardTable(match.superOver.secondInnings.batting, true) + `</div>`;
        html += `<div class='scorecard-section'><h4>${match.superOver.firstBatName} Super Over Bowling</h4>` + renderScorecardTable(match.superOver.firstInnings.bowling, false) + `</div>`;
        html += `<div class='scorecard-section'><h4>${match.superOver.secondBatName} Super Over Bowling</h4>` + renderScorecardTable(match.superOver.secondInnings.bowling, false) + `</div>`;
        html += `<div style='text-align:center;margin-top:10px;font-weight:bold;color:#e65100;'>Super Over Winner: ${match.superOver.winner}</div>`;
        html += `</div>`;
    }

    html += `<div style='text-align:center;margin-top:12px;'><button class='reset-btn' style='padding:8px 24px;font-size:1rem;' onclick='closeTournamentScorecard()'>Close</button></div>`;
    html += `</div>`;
    let modal = document.createElement('div');
    modal.id = 'scorecard-modal-container';
    modal.innerHTML = html;
    document.body.appendChild(modal);
}
function closeTournamentScorecard() {
    const modal = document.getElementById('scorecard-modal-container');
    if (modal) modal.remove();
}
function renderScorecardTable(data, isBatting) {
    if (isBatting) {
        let html = `<table class='scorecard-table'><thead><tr><th>Batsman</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th><th>Dismissal</th></tr></thead><tbody>`;
        data.forEach(player => {
            const sr = player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(1) : '0.0';
            html += `<tr><td>${player.name}</td><td>${player.runs}</td><td>${player.balls}</td><td>${player.fours}</td><td>${player.sixes}</td><td>${sr}</td><td>${player.dismissal || 'not out'}</td></tr>`;
        });
        html += '</tbody></table>';
        return html;
    } else {
        let html = `<table class='scorecard-table'><thead><tr><th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th>ECO</th></tr></thead><tbody>`;
        data.forEach(player => {
            html += `<tr><td>${player.name}</td><td>${player.overs}</td><td>${player.maidens}</td><td>${player.runs}</td><td>${player.wickets}</td><td>${player.economy}</td></tr>`;
        });
        html += '</tbody></table>';
        return html;
    }
}

function getRandomDismissal(batsman, bowler, fieldingLineup, isTournament = false) {
    // Probabilities: bowled 25%, caught 45%, lbw 15%, run out 10%, stumped 3%, hit wicket 2%
    const r = Math.random();
    let dismissal = '';
    if (r < 0.25) {
        dismissal = `b ${bowler.name}`;
    } else if (r < 0.70) {
        // Caught
        let fielders = fieldingLineup.filter(f => f.name !== bowler.name && f.name !== batsman.name);
        let fielder = fielders[Math.floor(Math.random() * fielders.length)]?.name || 'fielder';
        dismissal = `c ${fielder} b ${bowler.name}`;
    } else if (r < 0.85) {
        dismissal = `lbw b ${bowler.name}`;
    } else if (r < 0.95) {
        // Run out
        let fielders = fieldingLineup.filter(f => f.name !== batsman.name);
        let fielder = fielders[Math.floor(Math.random() * fielders.length)]?.name || 'fielder';
        dismissal = `run out (${fielder})`;
    } else if (r < 0.98) {
        // Stumped (simulate spinner with 50% chance)
        let wks = fieldingLineup.filter(f => f.role === 'wicketkeeper');
        let wk = wks.length ? wks[0].name : 'wk';
        dismissal = `stumped (${wk}) b ${bowler.name}`;
    } else {
        dismissal = 'hit wicket';
    }
    return dismissal;
}

// Lineup validation function
function validateLineup(lineup) {
    let bowlers = 0;
    let allrounders = 0;
    let wicketkeepers = 0;
    for (const player of lineup) {
        if (player.role === 'bowler') bowlers++;
        if (player.role === 'allrounder') allrounders++;
        if (player.role === 'wicketkeeper') wicketkeepers++;
    }
    // At least 1 WK
    if (wicketkeepers < 1) return false;
    // At least 3 bowlers (excluding allrounders)
    if (bowlers < 3) return false;
    // At least 5 bowlers+allrounders
    if ((bowlers + allrounders) < 5) return false;
    // At least 1 allrounder
    if (allrounders < 1) return false;
    return true;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    // Set default match type
    setMatchType('t20');
}); function simulateSuperOver(teamA, teamB) {
    // Super Over: 1 over each, 2 wickets max
    const superOverConfig = { overs: 1, maxWickets: 2 };

    // Random toss for Super Over
    const superOverTossWinner = Math.random() < 0.5 ? teamA : teamB;
    const superOverTossDecision = Math.random() < 0.5 ? 'bat' : 'bowl';

    let firstBat, secondBat;
    if (superOverTossDecision === 'bat') {
        firstBat = superOverTossWinner;
        secondBat = superOverTossWinner === teamA ? teamB : teamA;
    } else {
        firstBat = superOverTossWinner === teamA ? teamB : teamA;
        secondBat = superOverTossWinner === teamA ? teamA : teamB;
    }

    // Simulate Super Over innings
    const firstSuperOver = simulateTournamentInningsWithScorecard(firstBat, secondBat, superOverConfig);
    const secondSuperOver = simulateTournamentInningsWithScorecard(secondBat, firstBat, superOverConfig, firstSuperOver.total);

    let winner;
    if (secondSuperOver.total > firstSuperOver.total) {
        winner = secondBat.name;
    } else if (firstSuperOver.total > secondSuperOver.total) {
        winner = firstBat.name;
    } else {
        // If Super Over is also tied, count boundaries (4s and 6s)
        const firstBoundaries = firstSuperOver.batting.reduce((sum, p) => sum + p.fours + p.sixes, 0);
        const secondBoundaries = secondSuperOver.batting.reduce((sum, p) => sum + p.fours + p.sixes, 0);

        if (firstBoundaries > secondBoundaries) {
            winner = firstBat.name;
        } else if (secondBoundaries > firstBoundaries) {
            winner = secondBat.name;
        } else {
            // If still tied, first batting team wins
            winner = firstBat.name;
        }
    }

    return {
        firstInnings: firstSuperOver,
        secondInnings: secondSuperOver,
        firstBatName: firstBat.name,
        secondBatName: secondBat.name,
        tossWinner: superOverTossWinner.name,
        tossDecision: superOverTossDecision,
        winner
    };
}

function renderIPLPlayoffBracket() {
    const bracketDiv = document.getElementById('tournament-bracket');
    const resultsDiv = document.getElementById('tournament-results');

    // IPL Playoffs format: Qualifier 1, Eliminator, Qualifier 2, Final
    const matchNames = ['Qualifier 1', 'Eliminator', 'Qualifier 2', 'Final'];
    const teamKeys = tournamentState.teams;

    // Create the bracket structure
    const bracketContainer = document.createElement('div');
    bracketContainer.style.display = 'flex';
    bracketContainer.style.justifyContent = 'center';
    bracketContainer.style.gap = '40px';
    bracketContainer.style.flexWrap = 'wrap';

    // First round: Qualifier 1 and Eliminator
    const firstRound = document.createElement('div');
    firstRound.className = 'bracket-round';
    firstRound.style.display = 'flex';
    firstRound.style.flexDirection = 'column';
    firstRound.style.gap = '20px';

    // Qualifier 1 (Top 1 vs Top 2)
    const qualifier1Div = document.createElement('div');
    qualifier1Div.className = 'bracket-match';
    qualifier1Div.innerHTML = `<div style='font-weight:bold;color:#e65100;margin-bottom:8px;'>${matchNames[0]}</div>`;
    let matchResult = tournamentState.results[0];
    let matchData = tournamentState.matchData ? tournamentState.matchData[0] : null;
    if (matchResult && matchData) {
        qualifier1Div.classList.add('bracket-winner');
        let teamAScore = `${matchData.firstInnings.total}/${matchData.firstInnings.wickets} (${matchData.firstInnings.overs} ov)`;
        let teamBScore = `${matchData.secondInnings.total}/${matchData.secondInnings.wickets} (${matchData.secondInnings.overs} ov)`;
        let winnerText = matchResult;
        let resultDetails = '';

        if (matchData.superOver) {
            winnerText += ' (Super Over)';
            resultDetails = `<div style='font-size:0.9rem;color:#e65100;margin-top:4px;'>⚡ Both teams all out with equal scores → Super Over</div>`;
        } else if (matchData.firstInnings.total === matchData.secondInnings.total) {
            resultDetails = `<div style='font-size:0.9rem;color:#e65100;margin-top:4px;'>⚡ Equal scores - both teams all out</div>`;
        } else if (matchData.secondInnings.total > matchData.firstInnings.total) {
            resultDetails = `<div style='font-size:0.9rem;color:#4caf50;margin-top:4px;'>✅ Chasing team crossed target</div>`;
        } else {
            resultDetails = `<div style='font-size:0.9rem;color:#f44336;margin-top:4px;'>❌ Chasing team all out before crossing target</div>`;
        }

        qualifier1Div.innerHTML += `<span>${matchData.firstBatName} <span style='color:#4f46e5;font-weight:600;'>${teamAScore}</span> vs ${matchData.secondBatName} <span style='color:#4f46e5;font-weight:600;'>${teamBScore}</span></span><br><strong>Winner: <span style='color:#ff9800;cursor:pointer;text-decoration:underline;' onclick='showTournamentScorecard(0)'>${winnerText}</span></strong>${resultDetails}<br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;background:#667eea;' onclick='showTournamentScorecard(0)'>View Scorecard</button>`;
    } else {
        qualifier1Div.innerHTML += `<span>${teams[teamKeys[0]].name} vs ${teams[teamKeys[1]].name}</span><br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;' onclick='simulateTournamentMatch(0,"${teamKeys[0]}","${teamKeys[1]}")'>Simulate</button>`;
    }
    firstRound.appendChild(qualifier1Div);

    // Eliminator (Bottom 3 vs Bottom 4)
    const eliminatorDiv = document.createElement('div');
    eliminatorDiv.className = 'bracket-match';
    eliminatorDiv.innerHTML = `<div style='font-weight:bold;color:#e65100;margin-bottom:8px;'>${matchNames[1]}</div>`;
    matchResult = tournamentState.results[1];
    matchData = tournamentState.matchData ? tournamentState.matchData[1] : null;
    if (matchResult && matchData) {
        eliminatorDiv.classList.add('bracket-winner');
        let teamAScore = `${matchData.firstInnings.total}/${matchData.firstInnings.wickets} (${matchData.firstInnings.overs} ov)`;
        let teamBScore = `${matchData.secondInnings.total}/${matchData.secondInnings.wickets} (${matchData.secondInnings.overs} ov)`;
        let winnerText = matchResult;
        let resultDetails = '';

        if (matchData.superOver) {
            winnerText += ' (Super Over)';
            resultDetails = `<div style='font-size:0.9rem;color:#e65100;margin-top:4px;'>⚡ Both teams all out with equal scores → Super Over</div>`;
        } else if (matchData.firstInnings.total === matchData.secondInnings.total) {
            resultDetails = `<div style='font-size:0.9rem;color:#e65100;margin-top:4px;'>⚡ Equal scores - both teams all out</div>`;
        } else if (matchData.secondInnings.total > matchData.firstInnings.total) {
            resultDetails = `<div style='font-size:0.9rem;color:#4caf50;margin-top:4px;'>✅ Chasing team crossed target</div>`;
        } else {
            resultDetails = `<div style='font-size:0.9rem;color:#f44336;margin-top:4px;'>❌ Chasing team all out before crossing target</div>`;
        }

        eliminatorDiv.innerHTML += `<span>${matchData.firstBatName} <span style='color:#4f46e5;font-weight:600;'>${teamAScore}</span> vs ${matchData.secondBatName} <span style='color:#4f46e5;font-weight:600;'>${teamBScore}</span></span><br><strong>Winner: <span style='color:#ff9800;cursor:pointer;text-decoration:underline;' onclick='showTournamentScorecard(1)'>${winnerText}</span></strong>${resultDetails}<br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;background:#667eea;' onclick='showTournamentScorecard(1)'>View Scorecard</button>`;
    } else {
        eliminatorDiv.innerHTML += `<span>${teams[teamKeys[2]].name} vs ${teams[teamKeys[3]].name}</span><br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;' onclick='simulateTournamentMatch(1,"${teamKeys[2]}","${teamKeys[3]}")'>Simulate</button>`;
    }
    firstRound.appendChild(eliminatorDiv);

    bracketContainer.appendChild(firstRound);

    // Second round: Qualifier 2 and Final
    const secondRound = document.createElement('div');
    secondRound.className = 'bracket-round';
    secondRound.style.display = 'flex';
    secondRound.style.flexDirection = 'column';
    secondRound.style.gap = '20px';

    // Qualifier 2 (Loser Q1 vs Winner Eliminator)
    const qualifier2Div = document.createElement('div');
    qualifier2Div.className = 'bracket-match';
    qualifier2Div.innerHTML = `<div style='font-weight:bold;color:#e65100;margin-bottom:8px;'>${matchNames[2]}</div>`;
    matchResult = tournamentState.results[2];
    matchData = tournamentState.matchData ? tournamentState.matchData[2] : null;
    if (matchResult && matchData) {
        qualifier2Div.classList.add('bracket-winner');
        let teamAScore = `${matchData.firstInnings.total}/${matchData.firstInnings.wickets} (${matchData.firstInnings.overs} ov)`;
        let teamBScore = `${matchData.secondInnings.total}/${matchData.secondInnings.wickets} (${matchData.secondInnings.overs} ov)`;
        let winnerText = matchResult;
        let resultDetails = '';

        if (matchData.superOver) {
            winnerText += ' (Super Over)';
            resultDetails = `<div style='font-size:0.9rem;color:#e65100;margin-top:4px;'>⚡ Both teams all out with equal scores → Super Over</div>`;
        } else if (matchData.firstInnings.total === matchData.secondInnings.total) {
            resultDetails = `<div style='font-size:0.9rem;color:#e65100;margin-top:4px;'>⚡ Equal scores - both teams all out</div>`;
        } else if (matchData.secondInnings.total > matchData.firstInnings.total) {
            resultDetails = `<div style='font-size:0.9rem;color:#4caf50;margin-top:4px;'>✅ Chasing team crossed target</div>`;
        } else {
            resultDetails = `<div style='font-size:0.9rem;color:#f44336;margin-top:4px;'>❌ Chasing team all out before crossing target</div>`;
        }

        qualifier2Div.innerHTML += `<span>${matchData.firstBatName} <span style='color:#4f46e5;font-weight:600;'>${teamAScore}</span> vs ${matchData.secondBatName} <span style='color:#4f46e5;font-weight:600;'>${teamBScore}</span></span><br><strong>Winner: <span style='color:#ff9800;cursor:pointer;text-decoration:underline;' onclick='showTournamentScorecard(2)'>${winnerText}</span></strong>${resultDetails}<br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;background:#667eea;' onclick='showTournamentScorecard(2)'>View Scorecard</button>`;
    } else {
        // Determine teams for Qualifier 2 based on previous results
        let teamA = 'TBD';
        let teamB = 'TBD';
        let canSimulate = false;

        if (tournamentState.results[0] && tournamentState.results[1] && tournamentState.matchData[0] && tournamentState.matchData[1]) {
            // Get loser of Q1
            const q1Data = tournamentState.matchData[0];
            const q1Loser = q1Data.firstBatName === tournamentState.results[0] ? q1Data.secondBatName : q1Data.firstBatName;

            // Get winner of Eliminator
            const eliminatorData = tournamentState.matchData[1];
            const eliminatorWinner = eliminatorData.firstBatName === tournamentState.results[1] ? eliminatorData.firstBatName : eliminatorData.secondBatName;

            teamA = q1Loser;
            teamB = eliminatorWinner;
            canSimulate = true;
        }

        if (canSimulate) {
            qualifier2Div.innerHTML += `<span>${teamA} vs ${teamB}</span><br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;' onclick='simulateTournamentMatch(2,"","")'>Simulate</button>`;
        } else {
            qualifier2Div.innerHTML += `<span>TBD vs TBD</span><br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;' onclick='simulateTournamentMatch(2,"","")' disabled>Simulate</button>`;
        }
    }
    secondRound.appendChild(qualifier2Div);

    // Final (Winner Q1 vs Winner Q2)
    const finalDiv = document.createElement('div');
    finalDiv.className = 'bracket-match';
    finalDiv.innerHTML = `<div style='font-weight:bold;color:#e65100;margin-bottom:8px;'>${matchNames[3]}</div>`;
    matchResult = tournamentState.results[3];
    matchData = tournamentState.matchData ? tournamentState.matchData[3] : null;
    if (matchResult && matchData) {
        finalDiv.classList.add('bracket-winner');
        let teamAScore = `${matchData.firstInnings.total}/${matchData.firstInnings.wickets} (${matchData.firstInnings.overs} ov)`;
        let teamBScore = `${matchData.secondInnings.total}/${matchData.secondInnings.wickets} (${matchData.secondInnings.overs} ov)`;
        let winnerText = matchResult;
        let resultDetails = '';

        if (matchData.superOver) {
            winnerText += ' (Super Over)';
            resultDetails = `<div style='font-size:0.9rem;color:#e65100;margin-top:4px;'>⚡ Both teams all out with equal scores → Super Over</div>`;
        } else if (matchData.firstInnings.total === matchData.secondInnings.total) {
            resultDetails = `<div style='font-size:0.9rem;color:#e65100;margin-top:4px;'>⚡ Equal scores - both teams all out</div>`;
        } else if (matchData.secondInnings.total > matchData.firstInnings.total) {
            resultDetails = `<div style='font-size:0.9rem;color:#4caf50;margin-top:4px;'>✅ Chasing team crossed target</div>`;
        } else {
            resultDetails = `<div style='font-size:0.9rem;color:#f44336;margin-top:4px;'>❌ Chasing team all out before crossing target</div>`;
        }

        finalDiv.innerHTML += `<span>${matchData.firstBatName} <span style='color:#4f46e5;font-weight:600;'>${teamAScore}</span> vs ${matchData.secondBatName} <span style='color:#4f46e5;font-weight:600;'>${teamBScore}</span></span><br><strong>Winner: <span style='color:#ff9800;cursor:pointer;text-decoration:underline;' onclick='showTournamentScorecard(3)'>${winnerText}</span></strong>${resultDetails}<br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;background:#667eea;' onclick='showTournamentScorecard(3)'>View Scorecard</button>`;
    } else {
        // Determine teams for Final based on previous results
        let teamA = 'TBD';
        let teamB = 'TBD';
        let canSimulate = false;

        if (tournamentState.results[0] && tournamentState.results[2] && tournamentState.matchData[0] && tournamentState.matchData[2]) {
            // Get winner of Q1
            const q1Data = tournamentState.matchData[0];
            const q1Winner = q1Data.firstBatName === tournamentState.results[0] ? q1Data.firstBatName : q1Data.secondBatName;

            // Get winner of Q2
            const q2Data = tournamentState.matchData[2];
            const q2Winner = q2Data.firstBatName === tournamentState.results[2] ? q2Data.firstBatName : q2Data.secondBatName;

            teamA = q1Winner;
            teamB = q2Winner;
            canSimulate = true;
        }

        if (canSimulate) {
            finalDiv.innerHTML += `<span>${teamA} vs ${teamB}</span><br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;' onclick='simulateTournamentMatch(3,"","")'>Simulate</button>`;
        } else {
            finalDiv.innerHTML += `<span>TBD vs TBD</span><br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;' onclick='simulateTournamentMatch(3,"","")' disabled>Simulate</button>`;
        }
    }
    secondRound.appendChild(finalDiv);

    bracketContainer.appendChild(secondRound);

    bracketDiv.appendChild(bracketContainer);

    if (tournamentState.winner) {
        resultsDiv.innerHTML = `<div class='bracket-match bracket-winner' style='font-size:1.2rem;'>🏆 IPL Champion: ${teams[tournamentState.winner].name} 🏆</div>`;
    }
}

function renderTriSeriesBracket() {
    const bracketDiv = document.getElementById('tournament-bracket');
    const resultsDiv = document.getElementById('tournament-results');

    // Tri-Series format: Match 1, Match 2, Match 3, Final
    const matchNames = ['Match 1', 'Match 2', 'Match 3', 'Final'];
    const teamKeys = tournamentState.teams;

    const bracketContainer = document.createElement('div');
    bracketContainer.style.display = 'flex';
    bracketContainer.style.flexDirection = 'column';
    bracketContainer.style.gap = '20px';

    // League Stage
    const leagueStage = document.createElement('div');
    leagueStage.innerHTML = '<h3 style="margin-bottom: 10px;">League Stage</h3>';
    leagueStage.style.display = 'flex';
    leagueStage.style.gap = '20px';
    leagueStage.style.flexWrap = 'wrap';
    leagueStage.style.justifyContent = 'center';

    const pairs = [[0, 1], [1, 2], [2, 0]];

    for (let i = 0; i < 3; i++) {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'bracket-match';
        matchDiv.innerHTML = `<div style='font-weight:bold;color:#e65100;margin-bottom:8px;'>${matchNames[i]}</div>`;
        let matchResult = tournamentState.results[i];
        let matchData = tournamentState.matchData ? tournamentState.matchData[i] : null;

        if (matchResult && matchData) {
            matchDiv.classList.add('bracket-winner');
            let teamAScore = `${matchData.firstInnings.total}/${matchData.firstInnings.wickets} (${matchData.firstInnings.overs} ov)`;
            let teamBScore = `${matchData.secondInnings.total}/${matchData.secondInnings.wickets} (${matchData.secondInnings.overs} ov)`;
            matchDiv.innerHTML += `<span>${matchData.firstBatName} <span style='color:#4f46e5;font-weight:600;'>${teamAScore}</span> vs ${matchData.secondBatName} <span style='color:#4f46e5;font-weight:600;'>${teamBScore}</span></span><br><strong>Winner: <span style='color:#ff9800;cursor:pointer;text-decoration:underline;' onclick='showTournamentScorecard(${i})'>${matchResult}</span></strong><br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;background:#667eea;' onclick='showTournamentScorecard(${i})'>View Scorecard</button>`;
        } else {
            // Previous matches must be played
            const canPlay = i === 0 || tournamentState.results[i - 1];
            if (canPlay) {
                matchDiv.innerHTML += `<span>${teams[teamKeys[pairs[i][0]]].name} vs ${teams[teamKeys[pairs[i][1]]].name}</span><br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;' onclick='simulateTournamentMatch(${i},"${teamKeys[pairs[i][0]]}","${teamKeys[pairs[i][1]]}")'>Simulate</button>`;
            } else {
                matchDiv.innerHTML += `<span>${teams[teamKeys[pairs[i][0]]].name} vs ${teams[teamKeys[pairs[i][1]]].name}</span><br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;' disabled>Simulate</button>`;
            }
        }
        leagueStage.appendChild(matchDiv);
    }
    bracketContainer.appendChild(leagueStage);

    // Final
    const finalStage = document.createElement('div');
    finalStage.innerHTML = '<h3 style="margin-bottom: 10px;">Final</h3>';
    finalStage.style.display = 'flex';
    finalStage.style.justifyContent = 'center';

    const finalDiv = document.createElement('div');
    finalDiv.className = 'bracket-match';
    finalDiv.innerHTML = `<div style='font-weight:bold;color:#e65100;margin-bottom:8px;'>Final</div>`;

    let finalResult = tournamentState.results[3];
    let finalData = tournamentState.matchData ? tournamentState.matchData[3] : null;

    if (finalResult && finalData) {
        finalDiv.classList.add('bracket-winner');
        let teamAScore = `${finalData.firstInnings.total}/${finalData.firstInnings.wickets} (${finalData.firstInnings.overs} ov)`;
        let teamBScore = `${finalData.secondInnings.total}/${finalData.secondInnings.wickets} (${finalData.secondInnings.overs} ov)`;
        finalDiv.innerHTML += `<span>${finalData.firstBatName} <span style='color:#4f46e5;font-weight:600;'>${teamAScore}</span> vs ${finalData.secondBatName} <span style='color:#4f46e5;font-weight:600;'>${teamBScore}</span></span><br><strong>Winner: <span style='color:#ff9800;cursor:pointer;text-decoration:underline;' onclick='showTournamentScorecard(3)'>${finalResult}</span></strong><br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;background:#667eea;' onclick='showTournamentScorecard(3)'>View Scorecard</button>`;
        resultsDiv.innerHTML = `<div class='bracket-match bracket-winner' style='font-size:1.2rem; margin-top: 20px;'>🏆 Tri-Series Champion: ${finalResult} 🏆</div>`;
        tournamentState.winner = finalResult;
    } else {
        // Can we play final?
        if (tournamentState.results[0] && tournamentState.results[1] && tournamentState.results[2]) {
            // Calculate standings
            let points = { [teamKeys[0]]: 0, [teamKeys[1]]: 0, [teamKeys[2]]: 0 };
            let nrrRuns = {
                [teamKeys[0]]: { scored: 0, oversFaced: 0, conceded: 0, oversBowled: 0 },
                [teamKeys[1]]: { scored: 0, oversFaced: 0, conceded: 0, oversBowled: 0 },
                [teamKeys[2]]: { scored: 0, oversFaced: 0, conceded: 0, oversBowled: 0 }
            };

            for (let i = 0; i < 3; i++) {
                let d = tournamentState.matchData[i];
                if (tournamentState.results[i] === d.firstBatName) points[d.firstBatKey] += 2;
                else if (tournamentState.results[i] === d.secondBatName) points[d.secondBatKey] += 2;
                else { points[d.firstBatKey] += 1; points[d.secondBatKey] += 1; }

                nrrRuns[d.firstBatKey].scored += d.firstInnings.total;
                nrrRuns[d.firstBatKey].oversFaced += parseFloat(d.firstInnings.overs);
                nrrRuns[d.firstBatKey].conceded += d.secondInnings.total;
                nrrRuns[d.firstBatKey].oversBowled += parseFloat(d.secondInnings.overs);

                nrrRuns[d.secondBatKey].scored += d.secondInnings.total;
                nrrRuns[d.secondBatKey].oversFaced += parseFloat(d.secondInnings.overs);
                nrrRuns[d.secondBatKey].conceded += d.firstInnings.total;
                nrrRuns[d.secondBatKey].oversBowled += parseFloat(d.firstInnings.overs);
            }

            let standings = teamKeys.map(k => {
                let nrr = (nrrRuns[k].oversFaced > 0 && nrrRuns[k].oversBowled > 0) ? (nrrRuns[k].scored / nrrRuns[k].oversFaced) - (nrrRuns[k].conceded / nrrRuns[k].oversBowled) : 0;
                return { key: k, pts: points[k], nrr: nrr };
            });
            standings.sort((a, b) => b.pts - a.pts || b.nrr - a.nrr);

            let top1 = standings[0].key;
            let top2 = standings[1].key;

            finalDiv.innerHTML += `<span>${teams[top1].name} vs ${teams[top2].name}</span><br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;' onclick='simulateTournamentMatch(3,"${top1}","${top2}")'>Simulate</button>`;
        } else {
            finalDiv.innerHTML += `<span>TBD vs TBD</span><br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;' disabled>Simulate</button>`;
        }
    }
    finalStage.appendChild(finalDiv);
    bracketContainer.appendChild(finalStage);
    bracketDiv.appendChild(bracketContainer);
}

// Tour Series Variables
let tourSeriesState = {
    type: null,
    teamA: null,
    teamB: null,
    results: [],
    matchData: [],
    seriesWinner: null
};

// Tour Series Functions
function startTestSeries(seriesType) {
    tourSeriesState = {
        type: seriesType,
        teamA: null,
        teamB: null,
        results: [],
        matchData: [],
        seriesWinner: null
    };

    // Set teams based on series type
    switch (seriesType) {
        case 'ashes':
            tourSeriesState.teamA = 'england';
            tourSeriesState.teamB = 'australia';
            break;
        case 'pataudi':
            tourSeriesState.teamA = 'india';
            tourSeriesState.teamB = 'england';
            break;
        case 'border-gavaskar':
            tourSeriesState.teamA = 'india';
            tourSeriesState.teamB = 'australia';
            break;
        case 'freedom':
            tourSeriesState.teamA = 'india';
            tourSeriesState.teamB = 'southafrica';
            break;
        case 'basil-doliveira':
            tourSeriesState.teamA = 'england';
            tourSeriesState.teamB = 'southafrica';
            break;
        case 'tangiwai':
            tourSeriesState.teamA = 'newzealand';
            tourSeriesState.teamB = 'southafrica';
            break;
        case 'transtasman':
            tourSeriesState.teamA = 'australia';
            tourSeriesState.teamB = 'newzealand';
            break;
    }

    // Hide setup section and show series section
    document.querySelector('.tournament-setup').style.display = 'none';
    document.getElementById('tour-series-section').style.display = 'block';

    // Add back button
    addBackButton();

    // Render the series bracket
    renderTourSeriesBracket();
}

function renderTourSeriesBracket() {
    const bracketDiv = document.getElementById('tour-series-bracket');
    const resultsDiv = document.getElementById('tour-series-results');

    bracketDiv.innerHTML = '';
    resultsDiv.innerHTML = '';

    const seriesNames = {
        'ashes': 'The Ashes',
        'pataudi': 'Pataudi Trophy',
        'border-gavaskar': 'Border-Gavaskar Trophy',
        'freedom': 'Freedom Trophy',
        'basil-doliveira': 'Basil D\'Oliveira Trophy',
        'tangiwai': 'Tangiwai Shield',
        'transtasman': 'Trans-Tasman Trophy'
    };

    const seriesName = seriesNames[tourSeriesState.type];
    const teamAName = teams[tourSeriesState.teamA].name;
    const teamBName = teams[tourSeriesState.teamB].name;

    bracketDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 24px;">
            <h3 style="color: #1f2937; font-size: 1.5rem; margin-bottom: 8px;">${seriesName}</h3>
            <p style="color: #6b7280; font-size: 1.1rem;">${teamAName} vs ${teamBName} - 5 Test Matches</p>
        </div>
    `;

    // Create match grid
    const matchGrid = document.createElement('div');
    matchGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-top: 20px;';

    for (let i = 0; i < 5; i++) {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'bracket-match';
        matchDiv.style.cssText = 'background: #fff8e1; border-radius: 10px; padding: 16px; border: 1.5px solid #ffe0b2; text-align: center;';

        const matchResult = tourSeriesState.results[i];
        const matchData = tourSeriesState.matchData[i];

        if (matchResult && matchData) {
            matchDiv.classList.add('bracket-winner');
            matchDiv.style.background = 'linear-gradient(120deg, #ff5100 0%, #fb8c00 100%)';
            matchDiv.style.color = '#fff';

            let resultText = '';
            if (matchData.result === 'win') {
                resultText = `${matchResult} won by ${matchData.margin}`;
            } else if (matchData.result === 'draw') {
                resultText = 'Match Drawn';
            } else if (matchData.result === 'tie') {
                resultText = 'Match Tied';
            }

            // Use the actual team names from the match data
            const firstTeamName = matchData.firstBattingTeam || teamAName;
            const secondTeamName = matchData.secondBattingTeam || teamBName;

            const firstTeamTotal = matchData.firstInnings.total + matchData.thirdInnings.total;
            const secondTeamTotal = matchData.secondInnings.total + matchData.fourthInnings.total;

            matchDiv.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 8px;">Test ${i + 1}</div>
                <div style="font-size: 0.85rem; margin-bottom: 2px; text-align: left;">
                    <strong>${firstTeamName}:</strong><br>
                    &nbsp;&nbsp;1st: ${matchData.firstInnings.total}/${matchData.firstInnings.wickets}<br>
                    &nbsp;&nbsp;2nd: ${matchData.thirdInnings.total}/${matchData.thirdInnings.wickets}<br>
                    <strong>Total: ${firstTeamTotal}</strong>
                </div>
                <div style="font-size: 0.85rem; margin-bottom: 8px; text-align: left;">
                    <strong>${secondTeamName}:</strong><br>
                    &nbsp;&nbsp;1st: ${matchData.secondInnings.total}/${matchData.secondInnings.wickets}<br>
                    &nbsp;&nbsp;2nd: ${matchData.fourthInnings.total}/${matchData.fourthInnings.wickets}<br>
                    <strong>Total: ${secondTeamTotal}</strong>
                </div>
                <div style="font-weight: bold; font-size: 0.9rem; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 8px;">${resultText}</div>
                <button class="simulate-btn" style="margin-top: 8px; padding: 6px 12px; font-size: 0.9rem; background: #667eea;" onclick="showTourSeriesScorecard(${i})">View Scorecard</button>
            `;
        } else {
            matchDiv.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 8px;">Test ${i + 1}</div>
                <div style="margin-bottom: 8px;">${teamAName} vs ${teamBName}</div>
                <button class="simulate-btn" style="padding: 6px 12px; font-size: 0.9rem;" onclick="simulateTourSeriesMatch(${i})">Simulate</button>
            `;
        }

        matchGrid.appendChild(matchDiv);
    }

    bracketDiv.appendChild(matchGrid);

    // Show series result if completed
    if (tourSeriesState.seriesWinner) {
        const teamAWins = tourSeriesState.results.filter(r => r === teamAName).length;
        const teamBWins = tourSeriesState.results.filter(r => r === teamBName).length;
        const draws = tourSeriesState.results.filter(r => r === 'Draw').length;

        resultsDiv.innerHTML = `
            <div class="bracket-match bracket-winner" style="font-size: 1.2rem; margin-top: 24px; text-align: center;">
                🏆 ${seriesName} Winner: ${teams[tourSeriesState.seriesWinner].name} 🏆
            </div>
            <div style="text-align: center; margin-top: 16px; color: #6b7280;">
                <div>${teamAName}: ${teamAWins} wins</div>
                <div>${teamBName}: ${teamBWins} wins</div>
                <div>Draws: ${draws}</div>
            </div>
        `;
    }
}

function simulateTourSeriesMatch(matchIndex) {
    const teamA = teams[tourSeriesState.teamA];
    const teamB = teams[tourSeriesState.teamB];

    // Set match type to test
    currentMatchType = 'test';

    // Simulate the test match
    const matchResult = simulateTestMatch(teamA, teamB);

    // Store results
    tourSeriesState.results[matchIndex] = matchResult.winner;
    tourSeriesState.matchData[matchIndex] = matchResult;

    // Check if series is complete
    const teamAWins = tourSeriesState.results.filter(r => r === teamA.name).length;
    const teamBWins = tourSeriesState.results.filter(r => r === teamB.name).length;

    if (teamAWins >= 3 || teamBWins >= 3) {
        tourSeriesState.seriesWinner = teamAWins >= 3 ? tourSeriesState.teamA : tourSeriesState.teamB;
    }

    // Re-render the bracket
    renderTourSeriesBracket();
}

function simulateTestMatch(teamA, teamB) {
    // Randomly decide which team bats first for more balanced results
    const tossWinner = Math.random() < 0.5 ? 'teamA' : 'teamB';
    const firstBattingTeam = tossWinner === 'teamA' ? teamA : teamB;
    const secondBattingTeam = tossWinner === 'teamA' ? teamB : teamA;

    // Simulate a test match with 4 innings and total over limit
    const config = {
        maxWickets: 10,
        type: 'test',
        totalOversLimit: 450 // Total overs limit for the entire match
    };

    // Get best eleven for each team
    const firstBattingLineup = getBestEleven(firstBattingTeam.players);
    const secondBattingLineup = getBestEleven(secondBattingTeam.players);

    // Use the same lineup for batting and bowling (simplified)
    const firstBowlingLineup = firstBattingLineup;
    const secondBowlingLineup = secondBattingLineup;

    // Track total overs used in the match
    let totalOversUsed = 0;
    let matchDrawn = false;

    // Declare innings variables in the correct scope
    let firstInnings, secondInnings, thirdInnings, fourthInnings;

    // First innings
    firstInnings = simulateTestInnings(firstBattingLineup, secondBowlingLineup, config, 1, null, totalOversUsed);
    totalOversUsed += firstInnings.overs;

    // Check if match should be drawn due to time limit
    if (totalOversUsed >= config.totalOversLimit) {
        matchDrawn = true;
    }

    // Second innings
    if (!matchDrawn) {
        secondInnings = simulateTestInnings(secondBattingLineup, firstBowlingLineup, config, 2, null, totalOversUsed);
        totalOversUsed += secondInnings.overs;

        if (totalOversUsed >= config.totalOversLimit) {
            matchDrawn = true;
        }
    } else {
        secondInnings = { total: 0, wickets: 0, overs: 0, batting: [], bowling: [] };
    }

    // Third innings - First team bats again
    if (!matchDrawn) {
        thirdInnings = simulateTestInnings(firstBattingLineup, secondBowlingLineup, config, 3, null, totalOversUsed);
        totalOversUsed += thirdInnings.overs;

        if (totalOversUsed >= config.totalOversLimit) {
            matchDrawn = true;
        }
    } else {
        thirdInnings = { total: 0, wickets: 0, overs: 0, batting: [], bowling: [] };
    }

    // Fourth innings - Second team bats again with target
    if (!matchDrawn) {
        const targetForSecondTeam = firstInnings.total + thirdInnings.total - secondInnings.total;
        // Only set target if it's positive (team needs to chase)
        const target = targetForSecondTeam > 0 ? targetForSecondTeam : null;

        fourthInnings = simulateTestInnings(secondBattingLineup, firstBowlingLineup, config, 4, target, totalOversUsed);
        totalOversUsed += fourthInnings.overs;

        if (totalOversUsed >= config.totalOversLimit) {
            matchDrawn = true;
        }
    } else {
        fourthInnings = { total: 0, wickets: 0, overs: 0, batting: [], bowling: [] };
    }

    // Determine result
    let winner = null;
    let result = 'draw';
    let margin = '';

    if (matchDrawn) {
        result = 'draw';
        margin = 'Time limit reached (450 overs)';
    } else {
        const firstTeamTotal = firstInnings.total + thirdInnings.total;
        const secondTeamTotal = secondInnings.total + fourthInnings.total;

        if (firstTeamTotal > secondTeamTotal) {
            winner = firstBattingTeam.name;
            result = 'win';
            margin = `${firstTeamTotal - secondTeamTotal} runs`;
        } else if (secondTeamTotal > firstTeamTotal) {
            winner = secondBattingTeam.name;
            result = 'win';
            // Check if the second team (chasing team) reached the target
            if (fourthInnings.targetReached) {
                // Chasing team won by wickets remaining
                const wicketsRemaining = 10 - fourthInnings.wickets;
                margin = `${wicketsRemaining} wickets`;
            } else {
                // Second team won by runs (if they had a big lead from first innings)
                margin = `${secondTeamTotal - firstTeamTotal} runs`;
            }
        }
    }

    return {
        winner: winner || 'Draw',
        result: result,
        margin: margin,
        firstInnings: firstInnings,
        secondInnings: secondInnings,
        thirdInnings: thirdInnings,
        fourthInnings: fourthInnings,
        firstBattingTeam: firstBattingTeam.name,
        secondBattingTeam: secondBattingTeam.name,
        totalOvers: totalOversUsed
    };
}

function simulateTestInnings(battingLineup, bowlingLineup, config, inningsNum, target = null, totalOversUsed = 0) {
    // Simulate a single innings for a Test match

    const innings = {
        total: 0,
        wickets: 0,
        overs: 0,
        batting: [],
        bowling: [],
        targetReached: false
    };

    // Initialize batting stats
    battingLineup.forEach(player => {
        innings.batting.push({
            name: player.name,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            dismissal: null
        });
    });

    // Initialize bowling stats
    let bowlerStats = {};
    bowlingLineup.forEach(player => {
        bowlerStats[player.name] = {
            name: player.name,
            overs: 0,
            balls: 0,
            maidens: 0,
            runs: 0,
            wickets: 0,
            economy: 0
        };
    });

    let currentBatsman1 = 0;
    let currentBatsman2 = 1;
    let currentBowler = 0;
    let overRuns = 0;

    // Determine if this innings should end when all out or can continue after target
    const isFourthInnings = inningsNum === 4;
    const shouldEndWhenAllOut = !isFourthInnings || !target;

    // Calculate remaining overs for this match
    const remainingOvers = config.totalOversLimit - totalOversUsed;

    // Simulate overs (no per-innings limit, only total match limit)
    for (let over = 0; over < remainingOvers && innings.wickets < config.maxWickets; over++) {
        overRuns = 0;

        // Simulate balls in the over
        for (let ball = 0; ball < 6 && innings.wickets < config.maxWickets; ball++) {
            const batsman = battingLineup[currentBatsman1];
            const bowler = bowlingLineup[currentBowler];

            if (!batsman || !bowler) {
                // Missing player - end the innings loop safely
                break;
            }

            let outcome = calculateBallOutcome(batsman, bowler);

            // Enforce golden duck only rule
            if (outcome === 'out' && innings.batting[currentBatsman1].runs === 0 && innings.batting[currentBatsman1].balls > 0) {
                outcome = '0';
            }

            // Increment balls for legal deliveries
            if (outcome !== 'wide' && outcome !== 'noball') {
                innings.batting[currentBatsman1].balls++;
            }

            let runs = 0;

            if (outcome === 'out') {
                innings.batting[currentBatsman1].dismissal = getRandomDismissal(batsman, bowler, bowlingLineup, true);
                innings.wickets++;
                bowlerStats[bowler.name].wickets++;
                currentBatsman1 = Math.max(currentBatsman1, currentBatsman2) + 1;
                if (currentBatsman1 >= battingLineup.length) {
                    // All out - end innings
                    innings.overs = over + (ball + 1) / 6;
                    break;
                }
            } else if (['0', '1', '2', '3', '4', '6'].includes(outcome)) {
                runs = parseInt(outcome);
                innings.batting[currentBatsman1].runs += runs;
                if (runs === 4) innings.batting[currentBatsman1].fours++;
                if (runs === 6) innings.batting[currentBatsman1].sixes++;
                innings.total += runs;
                bowlerStats[bowler.name].runs += runs;
                overRuns += runs;
                if (runs % 2 === 1) {
                    [currentBatsman1, currentBatsman2] = [currentBatsman2, currentBatsman1];
                }
            } else if (outcome === 'wide' || outcome === 'noball') {
                innings.total += 1;
                bowlerStats[bowler.name].runs += 1;
                overRuns += 1;
                ball--;
                continue;
            }

            // Increment balls for legal deliveries
            bowlerStats[bowler.name].balls = (bowlerStats[bowler.name].balls || 0) + 1;
            bowlerStats[bowler.name].overs = ((over * 6 + ball + 1) / 6).toFixed(1);

            // Check if target is reached (only for 4th innings)
            if (isFourthInnings && target && innings.total >= target) {
                innings.targetReached = true;
                innings.overs = over + (ball + 1) / 6;
                break;
            }
        }

        // Check if all out after the over
        if (innings.wickets >= config.maxWickets) {
            innings.overs = over + 1;
            break;
        }

        // Maiden over
        if (overRuns === 0) {
            bowlerStats[bowlingLineup[currentBowler].name].maidens++;
        }

        // Change bowler every 4 overs
        if ((over + 1) % 4 === 0) {
            currentBowler = (currentBowler + 1) % bowlingLineup.length;
        }

        innings.overs = over + 1;

        // Check if target is reached (only for 4th innings)
        if (isFourthInnings && target && innings.total >= target) {
            innings.targetReached = true;
            break;
        }
    }

    // Calculate economy rates
    Object.values(bowlerStats).forEach(bowler => {
        const oversNum = parseFloat(bowler.overs);
        if (oversNum > 0) {
            bowler.economy = (bowler.runs / oversNum).toFixed(2);
        }
    });

    // Format bowling stats
    innings.bowling = Object.values(bowlerStats).filter(b => b.balls > 0).map(b => {
        const overs = Math.floor(b.balls / 6) + "." + (b.balls % 6);
        return { ...b, overs };
    });

    return {
        ...innings,
        totalOvers: totalOversUsed + innings.overs
    };
}

function showTourSeriesScorecard(matchIndex) {
    const matchData = tourSeriesState.matchData[matchIndex];
    if (!matchData) return;

    // Create modal for scorecard
    const modalBg = document.createElement('div');
    modalBg.className = 'scorecard-modal-bg';
    modalBg.onclick = () => document.body.removeChild(modalBg);

    const modal = document.createElement('div');
    modal.className = 'scorecard-modal';
    modal.onclick = (e) => e.stopPropagation();

    const teamAName = teams[tourSeriesState.teamA].name;
    const teamBName = teams[tourSeriesState.teamB].name;

    modal.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-bottom: 8px;">Test ${matchIndex + 1} Scorecard</h3>
            <p style="color: #6b7280;">${teamAName} vs ${teamBName}</p>
        </div>
        <div style="max-height: 60vh; overflow-y: auto;">
            <div style="margin-bottom: 16px;">
                <h4 style="color: #4f46e5; margin-bottom: 8px;">${teamAName} 1st Innings - ${matchData.firstInnings.total}/${matchData.firstInnings.wickets}</h4>
                <div style="font-size: 0.9rem; color: #6b7280;">
                    Overs: ${matchData.firstInnings.overs}
                </div>
            </div>
            <div style="margin-bottom: 16px;">
                <h4 style="color: #4f46e5; margin-bottom: 8px;">${teamBName} 1st Innings - ${matchData.secondInnings.total}/${matchData.secondInnings.wickets}</h4>
                <div style="font-size: 0.9rem; color: #6b7280;">
                    Overs: ${matchData.secondInnings.overs}
                </div>
            </div>
            <div style="margin-bottom: 16px;">
                <h4 style="color: #4f46e5; margin-bottom: 8px;">${teamAName} 2nd Innings - ${matchData.thirdInnings.total}/${matchData.thirdInnings.wickets}</h4>
                <div style="font-size: 0.9rem; color: #6b7280;">
                    Overs: ${matchData.thirdInnings.overs}
                </div>
            </div>
            <div style="margin-bottom: 16px;">
                <h4 style="color: #4f46e5; margin-bottom: 8px;">${teamBName} 2nd Innings - ${matchData.fourthInnings.total}/${matchData.fourthInnings.wickets}</h4>
                <div style="font-size: 0.9rem; color: #6b7280;">
                    Overs: ${matchData.fourthInnings.overs}
                </div>
            </div>
            <div style="text-align: center; margin-top: 20px; padding: 12px; background: #f8f9fa; border-radius: 8px;">
                <strong style="color: #1f2937;">Final Result: ${matchData.winner} ${matchData.result === 'win' ? `won by ${matchData.margin}` : matchData.result}</strong>
            </div>
        </div>
        <button onclick="document.body.removeChild(modalBg)" style="margin-top: 16px; padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">Close</button>
    `;

    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

function resetTourSeries() {
    tourSeriesState = {
        type: null,
        teamA: null,
        teamB: null,
        results: [],
        matchData: [],
        seriesWinner: null
    };

    // Remove any existing back buttons
    const seriesSection = document.getElementById('tour-series-section');
    const existingBackBtn = seriesSection.querySelector('.back-btn');
    if (existingBackBtn) {
        existingBackBtn.remove();
    }

    // Show setup section and hide series section
    document.querySelector('.tournament-setup').style.display = 'block';
    document.getElementById('tour-series-section').style.display = 'none';
}

// Add back button functionality
function addBackButton() {
    const seriesSection = document.getElementById('tour-series-section');
    if (!seriesSection.querySelector('.back-btn')) {
        const backBtn = document.createElement('button');
        backBtn.className = 'reset-btn back-btn';
        backBtn.style.cssText = 'margin-bottom: 20px;';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Tour Selection';
        backBtn.onclick = resetTourSeries;
        seriesSection.insertBefore(backBtn, seriesSection.firstChild);
    }
}

// Lightweight debug helper (safe): prints available teams and a short sanity check
function testTourSeries() {
    // This helper is intentionally lightweight to avoid heavy simulations from the UI button.
    try {
        console.log('Test tour series helper - available teams:', Object.keys(teams));
        const sample = Object.keys(teams).slice(0, 6).map(k => ({ key: k, name: teams[k].name, players: teams[k].players.length }));
        console.table(sample);
        alert('Debug: opened console. See available teams and sample squads.');
    } catch (e) {
        console.error('testTourSeries error:', e);
    }
}

// --- League tournament support (appended) ---
function getLeagueTeamKeys(preset) {
    if (preset === 'ipl') return ['rcb', 'csk', 'mi', 'gt', 'lsg', 'dc', 'srh', 'pbks', 'rr', 'kkr'];
    if (preset === 'bbl') return ['brisbane_heat', 'sydney_thunder', 'melbourne_stars', 'perth_scorchers', 'sydney_sixers', 'melbourne_renegades', 'adelaide_strikers', 'hobart_hurricanes'];
    if (preset === 'cpl') return ['antigua_barbuda_falcons', 'trinbago_knight_riders', 'guyana_amazon_warriors', 'barbados_royals', 'saint_lucia_kings', 'st_kitts_nevis_patriots'];
    if (preset === 'hundred') return ['southern_brave', 'northern_superchargers', 'welsh_fire', 'london_spirit', 'oval_invincibles', 'manchester_originals', 'birmingham_phoenix', 'trent_rockets'];
    if (preset === 'psl') return ['hyderabad_kingsmen', 'islamabad_united', 'karachi_kings', 'lahore_qalandars', 'multan_sultans', 'peshawar_zalmi', 'quetta_gladiators', 'rawalpindi_pindiz'];
    return null;
}

// League playoffs state for manual simulation
let leaguePlayoffState = null;

function resetLeagueTournament() {
    document.getElementById('league-panel').querySelector('.tournament-setup').style.display = 'block';
    document.getElementById('league-bracket-section').style.display = 'none';
}

function startLeagueTournament(preset) {
    const keys = getLeagueTeamKeys(preset);
    if (!keys || keys.length < 4) { alert('Invalid league preset'); return; }

    const format = 't20';
    const bracketDiv = document.getElementById('league-bracket');
    const resultsDiv = document.getElementById('league-results');
    const section = document.getElementById('league-bracket-section');
    if (!bracketDiv || !resultsDiv || !section) return;

    bracketDiv.innerHTML = '';
    resultsDiv.innerHTML = '';

    // Hide setup and show bracket
    document.getElementById('league-panel').querySelector('.tournament-setup').style.display = 'none';
    section.style.display = 'block';

    // Initialize league table
    const leagueTable = {};
    keys.forEach(key => {
        leagueTable[key] = {
            team: teams[key],
            played: 0,
            won: 0,
            lost: 0,
            tied: 0,
            points: 0,
            netRunRate: 0,
            runsFor: 0,
            runsAgainst: 0,
            oversFor: 0,
            oversAgainst: 0
        };
    });

    // Generate all possible match combinations (double round-robin)
    const matches = [];
    for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
            // Each pair plays twice (home and away)
            matches.push([keys[i], keys[j]]);
            matches.push([keys[j], keys[i]]);
        }
    }

    // Simulate all matches
    const matchResults = [];
    matches.forEach(([teamAKey, teamBKey], index) => {
        const teamA = teams[teamAKey];
        const teamB = teams[teamBKey];

        // Simulate the match
        const firstInnings = simulateTournamentInningsWithScorecard(teamA, teamB, matchConfigs[format]);
        const secondInnings = simulateTournamentInningsWithScorecard(teamB, teamA, matchConfigs[format], firstInnings.total);

        let winnerKey, loserKey, isTie = false;
        if (secondInnings.total > firstInnings.total) {
            winnerKey = teamBKey; loserKey = teamAKey;
        } else if (firstInnings.total > secondInnings.total) {
            winnerKey = teamAKey; loserKey = teamBKey;
        } else {
            // Super Over for ties
            const so = simulateSuperOver(teamA, teamB);
            if (so.winner === teamA.name) {
                winnerKey = teamAKey; loserKey = teamBKey;
            } else {
                winnerKey = teamBKey; loserKey = teamAKey;
            }
            isTie = true;
        }

        // Update league table
        leagueTable[teamAKey].played++;
        leagueTable[teamBKey].played++;

        if (isTie) {
            leagueTable[teamAKey].tied++;
            leagueTable[teamBKey].tied++;
            leagueTable[teamAKey].points += 1;
            leagueTable[teamBKey].points += 1;
        } else {
            leagueTable[winnerKey].won++;
            leagueTable[winnerKey].points += 2;
            leagueTable[loserKey].lost++;
        }

        // Update runs and overs
        leagueTable[teamAKey].runsFor += firstInnings.total;
        leagueTable[teamAKey].runsAgainst += secondInnings.total;
        leagueTable[teamAKey].oversFor += firstInnings.overs;
        leagueTable[teamAKey].oversAgainst += secondInnings.overs;

        leagueTable[teamBKey].runsFor += secondInnings.total;
        leagueTable[teamBKey].runsAgainst += firstInnings.total;
        leagueTable[teamBKey].oversFor += secondInnings.overs;
        leagueTable[teamBKey].oversAgainst += firstInnings.overs;

        matchResults.push({
            teamA: teamA.name,
            teamB: teamB.name,
            scoreA: `${firstInnings.total}/${firstInnings.wickets} (${firstInnings.overs})`,
            scoreB: `${secondInnings.total}/${secondInnings.wickets} (${secondInnings.overs})`,
            winner: isTie ? 'Tie' : teams[winnerKey].name
        });
    });

    // Calculate Net Run Rate
    Object.keys(leagueTable).forEach(key => {
        const team = leagueTable[key];
        if (team.oversFor > 0 && team.oversAgainst > 0) {
            const runRateFor = team.runsFor / team.oversFor;
            const runRateAgainst = team.runsAgainst / team.oversAgainst;
            team.netRunRate = runRateFor - runRateAgainst;
        }
    });

    // Sort table by points (desc), then by NRR (desc)
    const sortedTeams = Object.keys(leagueTable).sort((a, b) => {
        if (leagueTable[a].points !== leagueTable[b].points) {
            return leagueTable[b].points - leagueTable[a].points;
        }
        return leagueTable[b].netRunRate - leagueTable[a].netRunRate;
    });

    // Render league table
    const tableHTML = `
        <div class="league-table-container">
            <h3>${preset.toUpperCase()} League Table</h3>
            <table class="league-table">
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Team</th>
                        <th>P</th>
                        <th>W</th>
                        <th>L</th>
                        <th>T</th>
                        <th>Pts</th>
                        <th>NRR</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedTeams.map((key, index) => {
        const team = leagueTable[key];
        return `
                            <tr class="${index < 4 ? 'qualification' : ''}">
                                <td>${index + 1}</td>
                                <td>${team.team.name}</td>
                                <td>${team.played}</td>
                                <td>${team.won}</td>
                                <td>${team.lost}</td>
                                <td>${team.tied}</td>
                                <td>${team.points}</td>
                                <td>${team.netRunRate.toFixed(3)}</td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    // Prepare playoffs (manual simulation like IPL: Q1, Eliminator, Q2, Final)
    const top4 = sortedTeams.slice(0, 4); // [1,2,3,4]
    leaguePlayoffState = {
        teams: top4, // keys
        results: [null, null, null, null],
        matchData: {},
        preset
    };

    // Generate Top Performers (Top 18 shuffler)
    let allBatters = [];
    let allBowlers = [];
    keys.forEach(key => {
        const team = teams[key];
        team.players.forEach((player, pIdx) => {
            // Bias towards openers and top-order batters
            const orderBoost = pIdx < 3 ? 15 : (pIdx < 6 ? 5 : 0);
            allBatters.push({
                name: player.name,
                team: team.name,
                rating: player.batting + orderBoost,
            });
            if (player.role && (player.role.toLowerCase().includes('bowler') || player.role.toLowerCase().includes('allrounder'))) {
                allBowlers.push({
                    name: player.name,
                    team: team.name,
                    rating: player.bowling,
                });
            }
        });
    });

    // Sort by rating and get top 18
    allBatters.sort((a, b) => b.rating - a.rating);
    allBowlers.sort((a, b) => b.rating - a.rating);

    let top18Batters = allBatters.slice(0, 18);
    let top18Bowlers = allBowlers.slice(0, 18);

    // Add random variance for the final simulated stats
    top18Batters.forEach(b => {
        b.simRuns = Math.floor(b.rating * 4) + Math.floor(Math.random() * 250);
    });
    top18Bowlers.forEach(b => {
        b.simWickets = Math.floor(b.rating / 6) + Math.floor(Math.random() * 10);
    });

    // Sort by simulated stats
    top18Batters.sort((a, b) => b.simRuns - a.simRuns);
    top18Bowlers.sort((a, b) => b.simWickets - a.simWickets);

    const top5Batters = top18Batters.slice(0, 5);
    const top5Bowlers = top18Bowlers.slice(0, 5);

    const statsHTML = `
        <div style="display:flex; flex-direction:column; gap:20px; min-width: 280px;">
            <div class="bracket-match" style="text-align:left; padding: 15px;">
                <div style='font-weight:bold;color:#e65100;margin-bottom:12px;text-align:center;border-bottom:1px solid #ffe0b2;padding-bottom:8px;'>Top Runs</div>
                ${top5Batters.map((b, i) => `<div style="display:flex; justify-content:space-between; font-size:0.95rem; margin-bottom:8px; align-items:center;"><span><strong>${i + 1}.</strong> ${b.name} <br><span style="font-size:0.75rem;color:#666;">${b.team}</span></span> <span style="font-weight:bold; color:#4338ca; font-size:1.1rem;">${b.simRuns}</span></div>`).join('')}
            </div>
            <div class="bracket-match" style="text-align:left; padding: 15px;">
                <div style='font-weight:bold;color:#e65100;margin-bottom:12px;text-align:center;border-bottom:1px solid #ffe0b2;padding-bottom:8px;'>Top Wickets</div>
                ${top5Bowlers.map((b, i) => `<div style="display:flex; justify-content:space-between; font-size:0.95rem; margin-bottom:8px; align-items:center;"><span><strong>${i + 1}.</strong> ${b.name} <br><span style="font-size:0.75rem;color:#666;">${b.team}</span></span> <span style="font-weight:bold; color:#4338ca; font-size:1.1rem;">${b.simWickets}</span></div>`).join('')}
            </div>
        </div>
    `;

    // Build UI: league table + playoffs bracket with simulate buttons
    const playoffsHTML = `
        <div style="margin-top:24px;">
            <h3 style="text-align:center;color:#e65100;margin-bottom:16px;">League Playoffs & Top Performers</h3>
            <div style="display:flex;gap:30px;justify-content:center;flex-wrap:wrap;align-items:flex-start;">
                <!-- Playoffs Column -->
                <div style="display:flex;flex-wrap:wrap;gap:20px;max-width:500px;justify-content:center;">
                    <div class="bracket-match" id="league-q1">
                        <div style='font-weight:bold;color:#e65100;margin-bottom:8px;'>Qualifier 1</div>
                        <div>${teams[top4[0]].name} vs ${teams[top4[1]].name}</div>
                        <button class="simulate-btn" style="margin-top:8px;padding:6px 18px;font-size:0.98rem;" onclick="simulateLeaguePlayoffMatch(0)">Simulate</button>
                    </div>
                    <div class="bracket-match" id="league-elim">
                        <div style='font-weight:bold;color:#e65100;margin-bottom:8px;'>Eliminator</div>
                        <div>${teams[top4[2]].name} vs ${teams[top4[3]].name}</div>
                        <button class="simulate-btn" style="margin-top:8px;padding:6px 18px;font-size:0.98rem;" onclick="simulateLeaguePlayoffMatch(1)">Simulate</button>
                    </div>
                    <div class="bracket-match" id="league-q2">
                        <div style='font-weight:bold;color:#e65100;margin-bottom:8px;'>Qualifier 2</div>
                        <div>TBD vs TBD</div>
                        <button class="simulate-btn" style="margin-top:8px;padding:6px 18px;font-size:0.98rem;" onclick="simulateLeaguePlayoffMatch(2)" disabled>Simulate</button>
                    </div>
                    <div class="bracket-match" id="league-final">
                        <div style='font-weight:bold;color:#e65100;margin-bottom:8px;'>Final</div>
                        <div>TBD vs TBD</div>
                        <button class="simulate-btn" style="margin-top:8px;padding:6px 18px;font-size:0.98rem;" onclick="simulateLeaguePlayoffMatch(3)" disabled>Simulate</button>
                    </div>
                </div>
                <!-- Stats Column -->
                ${statsHTML}
            </div>
        </div>
    `;

    bracketDiv.innerHTML = tableHTML + playoffsHTML;

    // Show league stage leader (not champion yet)
    const leader = sortedTeams[0];
    resultsDiv.innerHTML = `
        <div class="league-champion">
            <h2>🏁 ${preset.toUpperCase()} League Leader: ${teams[leader].name}</h2>
            <p>Points: ${leagueTable[leader].points} | NRR: ${leagueTable[leader].netRunRate.toFixed(3)}</p>
            <p style="margin-top:6px;opacity:0.85;">Playoffs to decide the Champion.</p>
        </div>
    `;
}

function simulateLeaguePlayoffMatch(matchIdx) {
    if (!leaguePlayoffState) return;
    const { teams: top4, results, matchData, preset } = leaguePlayoffState;
    const format = 't20';

    // Resolve participants per matchIdx
    let aKey = null, bKey = null, labelId = '';
    if (matchIdx === 0) { // Qualifier 1: 1 vs 2
        aKey = top4[0]; bKey = top4[1]; labelId = 'league-q1';
    } else if (matchIdx === 1) { // Eliminator: 3 vs 4
        aKey = top4[2]; bKey = top4[3]; labelId = 'league-elim';
    } else if (matchIdx === 2) { // Qualifier 2: Loser Q1 vs Winner Eliminator
        if (results[0] && matchData[0] && results[1] && matchData[1]) {
            const q1Winner = results[0];
            const q1LoserKey = (matchData[0].firstBatName === q1Winner) ? matchData[0].secondBatKey : matchData[0].firstBatKey;
            const elimWinner = results[1];
            const elimWinnerKey = (matchData[1].firstBatName === elimWinner) ? matchData[1].firstBatKey : matchData[1].secondBatKey;
            aKey = q1LoserKey; bKey = elimWinnerKey; labelId = 'league-q2';
        }
    } else if (matchIdx === 3) { // Final: Winner Q1 vs Winner Q2
        if (results[0] && matchData[0] && results[2] && matchData[2]) {
            const q1Winner = results[0];
            const q1WinnerKey = (matchData[0].firstBatName === q1Winner) ? matchData[0].firstBatKey : matchData[0].secondBatKey;
            const q2Winner = results[2];
            const q2WinnerKey = (matchData[2].firstBatName === q2Winner) ? matchData[2].firstBatKey : matchData[2].secondBatKey;
            aKey = q1WinnerKey; bKey = q2WinnerKey; labelId = 'league-final';
        }
    }

    const container = document.getElementById(labelId);
    if (!aKey || !bKey || !container) return;

    const teamA = teams[aKey];
    const teamB = teams[bKey];
    const config = matchConfigs[format];

    // Random toss
    const tossWinner = Math.random() < 0.5 ? teamA : teamB;
    const tossDecision = Math.random() < 0.5 ? 'bat' : 'bowl';
    let firstBat, secondBat, firstKey, secondKey;
    if (tossDecision === 'bat') {
        firstBat = tossWinner; secondBat = tossWinner === teamA ? teamB : teamA;
        firstKey = tossWinner === teamA ? aKey : bKey; secondKey = tossWinner === teamA ? bKey : aKey;
    } else {
        firstBat = tossWinner === teamA ? teamB : teamA; secondBat = tossWinner === teamA ? teamA : teamB;
        firstKey = tossWinner === teamA ? bKey : aKey; secondKey = tossWinner === teamA ? aKey : bKey;
    }

    const firstInnings = simulateTournamentInningsWithScorecard(firstBat, secondBat, config);
    const secondInnings = simulateTournamentInningsWithScorecard(secondBat, firstBat, config, firstInnings.total);

    let winner;
    let superOverData = null;
    if (secondInnings.total > firstInnings.total) {
        winner = secondBat.name;
    } else if (firstInnings.total > secondInnings.total) {
        winner = firstBat.name;
    } else {
        const so = simulateSuperOver(firstBat, secondBat);
        winner = so.winner;
        superOverData = so;
    }

    // Store match data
    matchData[matchIdx] = {
        teamAKey: aKey, teamBKey: bKey,
        firstBatKey: firstKey, secondBatKey: secondKey,
        firstBatName: firstBat.name, secondBatName: secondBat.name,
        tossWinner: tossWinner.name, tossDecision,
        firstInnings, secondInnings,
        winner,
        format,
        ...(superOverData ? { superOver: superOverData } : {})
    };
    results[matchIdx] = winner;

    // Update UI for this match
    const teamAScore = `${firstInnings.total}/${firstInnings.wickets} (${firstInnings.overs} ov)`;
    const teamBScore = `${secondInnings.total}/${secondInnings.wickets} (${secondInnings.overs} ov)`;
    const matchLabel = container.id === 'league-q1' ? 'Qualifier 1' : container.id === 'league-elim' ? 'Eliminator' : container.id === 'league-q2' ? 'Qualifier 2' : 'Final';
    container.classList.add('bracket-winner');
    container.innerHTML = `
        <div style='font-weight:bold;color:#fff;margin-bottom:8px;'>${matchLabel}</div>
        <span>${firstBat.name} <span style='color:#fff;'>${teamAScore}</span> vs ${secondBat.name} <span style='color:#fff;'>${teamBScore}</span></span>
        <br><strong>Winner: ${winner}${superOverData ? ' (Super Over)' : ''}</strong>
        <br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;background:#667eea;' onclick='showLeaguePlayoffScorecard(${matchIdx})'>View Scorecard</button>
    `;

    // Enable next matches as appropriate
    if (matchIdx === 0 || matchIdx === 1) {
        // After Q1 and Eliminator, enable Q2 button if both done
        const q2Btn = document.querySelector('#league-q2 button.simulate-btn');
        if (leaguePlayoffState.results[0] && leaguePlayoffState.results[1] && q2Btn) {
            // Update team names
            const q2Div = document.getElementById('league-q2');
            const q1Data = leaguePlayoffState.matchData[0];
            const q1Winner = leaguePlayoffState.results[0];
            const q1Loser = q1Data.firstBatName === q1Winner ? q1Data.secondBatName : q1Data.firstBatName;
            const elimWinner = leaguePlayoffState.results[1];
            q2Div.querySelector('div:nth-child(2)').textContent = `${q1Loser} vs ${elimWinner}`;
            q2Btn.disabled = false;
        }
    } else if (matchIdx === 2) {
        // After Q2, enable Final
        const finalBtn = document.querySelector('#league-final button.simulate-btn');
        if (leaguePlayoffState.results[0] && leaguePlayoffState.results[2] && finalBtn) {
            const finalDiv = document.getElementById('league-final');
            const q1Winner = leaguePlayoffState.results[0];
            const q2Winner = leaguePlayoffState.results[2];
            finalDiv.querySelector('div:nth-child(2)').textContent = `${q1Winner} vs ${q2Winner}`;
            finalBtn.disabled = false;
        }
    } else if (matchIdx === 3) {
        // Final completed – show Champion
        const resultsDiv = document.getElementById('league-results');
        resultsDiv.innerHTML = `
            <div class="league-champion">
                <h2>🏆 ${leaguePlayoffState.preset.toUpperCase()} Champion: ${winner} 🏆</h2>
                <p>Decided via playoffs.</p>
            </div>
        `;
    }
}

// Show scorecard modal for a league playoff match
function showLeaguePlayoffScorecard(matchIdx) {
    if (!leaguePlayoffState || !leaguePlayoffState.matchData[matchIdx]) {
        alert('Scorecard not available yet for this match.');
        return;
    }
    const match = leaguePlayoffState.matchData[matchIdx];
    const matchLabel = ['Qualifier 1', 'Eliminator', 'Qualifier 2', 'Final'][matchIdx] || 'Playoff Match';
    let html = `<div class='scorecard-modal-bg' onclick='closeTournamentScorecard()'></div><div class='scorecard-modal'>`;
    html += `<h3 style='text-align:center;margin-bottom:10px;'>${matchLabel}: ${match.firstBatName} vs ${match.secondBatName}</h3>`;
    html += generateMatchNarrative(match);
    html += `<div style='margin-bottom:8px;text-align:center;font-size:1.05rem;'>Toss: <b>${match.tossWinner}</b> chose to <b>${match.tossDecision === 'bat' ? 'bat first' : 'bowl first'}</b></div>`;
    html += `<div class='scorecard-section'><h4>${match.firstBatName} Batting</h4>` + renderScorecardTable(match.firstInnings.batting, true) + `</div>`;
    html += `<div class='scorecard-section'><h4>${match.secondBatName} Batting</h4>` + renderScorecardTable(match.secondInnings.batting, true) + `</div>`;
    html += `<div class='scorecard-section'><h4>${match.firstBatName} Bowling</h4>` + renderScorecardTable(match.firstInnings.bowling, false) + `</div>`;
    html += `<div class='scorecard-section'><h4>${match.secondBatName} Bowling</h4>` + renderScorecardTable(match.secondInnings.bowling, false) + `</div>`;
    if (match.superOver) {
        html += `<div style='margin-top:20px;padding:15px;background:#fff3e0;border:2px solid #ff9800;border-radius:8px;'>`;
        html += `<h4 style='color:#e65100;text-align:center;margin-bottom:10px;'>⚡ SUPER OVER ⚡</h4>`;
        html += `<div class='scorecard-section'><h4>${match.superOver.firstBatName} Super Over Batting</h4>` + renderScorecardTable(match.superOver.firstInnings.batting, true) + `</div>`;
        html += `<div class='scorecard-section'><h4>${match.superOver.secondBatName} Super Over Batting</h4>` + renderScorecardTable(match.superOver.secondInnings.batting, true) + `</div>`;
        html += `<div style='text-align:center;font-weight:bold;color:#e65100;margin-top:8px;'>Super Over Winner: ${match.superOver.winner}</div></div>`;
    }
    html += `<div style='text-align:center;margin-top:12px;'><button class='reset-btn' style='padding:8px 24px;font-size:1rem;' onclick='closeTournamentScorecard()'>Close</button></div>`;
    html += `</div>`;
    let modal = document.createElement('div');
    modal.id = 'scorecard-modal-container';
    modal.innerHTML = html;
    document.body.appendChild(modal);
}

// Updated panel switcher to include league tab
function showPanel(panel) {
    const single = document.getElementById('single-panel');
    const league = document.getElementById('league-panel');
    const custom = document.getElementById('tournament-panel');
    const tours = document.getElementById('tours-panel');

    if (single) single.style.display = panel === 'single' ? 'block' : 'none';
    if (league) league.style.display = panel === 'league' ? 'block' : 'none';
    if (custom) custom.style.display = panel === 'tournament' ? 'block' : 'none';
    if (tours) tours.style.display = panel === 'tours' ? 'block' : 'none';

    const singleTab = document.getElementById('single-tab');
    const leagueTab = document.getElementById('league-tab');
    const customTab = document.getElementById('tournament-tab');
    const toursTab = document.getElementById('tours-tab');

    if (singleTab) singleTab.classList.toggle('active', panel === 'single');
    if (leagueTab) leagueTab.classList.toggle('active', panel === 'league');
    if (customTab) customTab.classList.toggle('active', panel === 'tournament');
    if (toursTab) toursTab.classList.toggle('active', panel === 'tours');

    if (panel === 'tournament' && typeof renderTournamentTeamSelectors === 'function') {
        renderTournamentTeamSelectors();
    }
}

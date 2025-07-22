// Global variables
let currentMatchType = 't20';
let team1Data = null;
let team2Data = null;
let matchResults = null;
let tossWinner = null;
let tossDecision = null;

// Team data with 20-man squads
const teams = {
    india: {
        name: 'India',
        players: [
            // Batsmen
            { name: 'Rohit Sharma', role: 'batsman', batting: 85, bowling: 20, captain: true },
            { name: 'Virat Kohli', role: 'batsman', batting: 88, bowling: 25 },
            { name: 'KL Rahul', role: 'batsman', batting: 82, bowling: 15 },
            { name: 'Shubman Gill', role: 'batsman', batting: 80, bowling: 10 },
            { name: 'Shreyas Iyer', role: 'batsman', batting: 78, bowling: 20 },
            { name: 'Suryakumar Yadav', role: 'batsman', batting: 83, bowling: 25 },
            { name: 'Rishabh Pant', role: 'wicketkeeper', batting: 80, bowling: 5 },
            { name: 'Sanju Samson', role: 'wicketkeeper', batting: 76, bowling: 5 },
            
            // All-rounders
            { name: 'Hardik Pandya', role: 'allrounder', batting: 75, bowling: 78 },
            { name: 'Ravindra Jadeja', role: 'allrounder', batting: 70, bowling: 82 },
            { name: 'Axar Patel', role: 'allrounder', batting: 65, bowling: 80 },
            { name: 'Washington Sundar', role: 'allrounder', batting: 68, bowling: 75 },
            
            // Bowlers
            { name: 'Jasprit Bumrah', role: 'bowler', batting: 25, bowling: 90 },
            { name: 'Mohammed Shami', role: 'bowler', batting: 20, bowling: 85 },
            { name: 'Mohammed Siraj', role: 'bowler', batting: 15, bowling: 82 },
            { name: 'Arshdeep Singh', role: 'bowler', batting: 18, bowling: 78 },
            { name: 'Yuzvendra Chahal', role: 'bowler', batting: 12, bowling: 83 },
            { name: 'Kuldeep Yadav', role: 'bowler', batting: 10, bowling: 81 },
            { name: 'Ravi Bishnoi', role: 'bowler', batting: 8, bowling: 79 },
            { name: 'Prasidh Krishna', role: 'bowler', batting: 5, bowling: 84 }
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
            { name: 'Cameron Green', role: 'allrounder', batting: 76, bowling: 80 },
            { name: 'Marcus Stoinis', role: 'allrounder', batting: 74, bowling: 75 },
            { name: 'Alex Carey', role: 'wicketkeeper', batting: 72, bowling: 5 },
            { name: 'Josh Inglis', role: 'wicketkeeper', batting: 70, bowling: 5 },
            
            // All-rounders
            { name: 'Glenn Maxwell', role: 'allrounder', batting: 81, bowling: 70 },
            { name: 'Mitchell Marsh', role: 'allrounder', batting: 73, bowling: 78 },
            { name: 'Sean Abbott', role: 'allrounder', batting: 65, bowling: 76 },
            { name: 'Ashton Agar', role: 'allrounder', batting: 60, bowling: 75 },
            
            // Bowlers
            { name: 'Pat Cummins', role: 'bowler', batting: 35, bowling: 88 },
            { name: 'Mitchell Starc', role: 'bowler', batting: 25, bowling: 87 },
            { name: 'Josh Hazlewood', role: 'bowler', batting: 20, bowling: 85 },
            { name: 'Adam Zampa', role: 'bowler', batting: 15, bowling: 82 },
            { name: 'Nathan Lyon', role: 'bowler', batting: 12, bowling: 84 },
            { name: 'Todd Murphy', role: 'bowler', batting: 8, bowling: 78 },
            { name: 'Lance Morris', role: 'bowler', batting: 5, bowling: 80 },
            { name: 'Scott Boland', role: 'bowler', batting: 10, bowling: 83 }
        ]
    },
    
    england: {
        name: 'England',
        players: [
            // Batsmen
            { name: 'Jos Buttler', role: 'wicketkeeper', batting: 85, bowling: 5, captain: true },
            { name: 'Jonny Bairstow', role: 'wicketkeeper', batting: 83, bowling: 5 },
            { name: 'Harry Brook', role: 'batsman', batting: 80, bowling: 15 },
            { name: 'Ben Duckett', role: 'batsman', batting: 77, bowling: 10 },
            { name: 'Ollie Pope', role: 'batsman', batting: 75, bowling: 20 },
            { name: 'Zak Crawley', role: 'batsman', batting: 72, bowling: 15 },
            { name: 'Phil Salt', role: 'wicketkeeper', batting: 78, bowling: 5 },
            { name: 'Will Jacks', role: 'allrounder', batting: 74, bowling: 70 },
            
            // All-rounders
            { name: 'Ben Stokes', role: 'allrounder', batting: 82, bowling: 85 },
            { name: 'Moeen Ali', role: 'allrounder', batting: 73, bowling: 78 },
            { name: 'Liam Livingstone', role: 'allrounder', batting: 76, bowling: 72 },
            { name: 'Sam Curran', role: 'allrounder', batting: 68, bowling: 75 },
            
            // Bowlers
            { name: 'Jofra Archer', role: 'bowler', batting: 25, bowling: 88 },
            { name: 'Mark Wood', role: 'bowler', batting: 20, bowling: 86 },
            { name: 'Chris Woakes', role: 'bowler', batting: 35, bowling: 82 },
            { name: 'Adil Rashid', role: 'bowler', batting: 15, bowling: 83 },
            { name: 'Jack Leach', role: 'bowler', batting: 12, bowling: 80 },
            { name: 'Reece Topley', role: 'bowler', batting: 8, bowling: 79 },
            { name: 'Gus Atkinson', role: 'bowler', batting: 5, bowling: 81 },
            { name: 'Brydon Carse', role: 'bowler', batting: 10, bowling: 77 }
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
            { name: 'Wiaan Mulder', role: 'allrounder', batting: 64, bowling: 74 },
            
            // Bowlers
            { name: 'Kagiso Rabada', role: 'bowler', batting: 25, bowling: 87 },
            { name: 'Anrich Nortje', role: 'bowler', batting: 15, bowling: 86 },
            { name: 'Lungi Ngidi', role: 'bowler', batting: 20, bowling: 83 },
            { name: 'Keshav Maharaj', role: 'bowler', batting: 18, bowling: 84 },
            { name: 'Tabraiz Shamsi', role: 'bowler', batting: 12, bowling: 82 },
            { name: 'Gerald Coetzee', role: 'bowler', batting: 8, bowling: 80 },
            { name: 'Lizaad Williams', role: 'bowler', batting: 5, bowling: 78 },
            { name: 'Bjorn Fortuin', role: 'bowler', batting: 10, bowling: 76 }
        ]
    },
    
    newzealand: {
        name: 'New Zealand',
        players: [
            // Batsmen
            { name: 'Kane Williamson', role: 'batsman', batting: 86, bowling: 25, captain: true },
            { name: 'Devon Conway', role: 'wicketkeeper', batting: 81, bowling: 5 },
            { name: 'Tom Latham', role: 'wicketkeeper', batting: 78, bowling: 5 },
            { name: 'Daryl Mitchell', role: 'allrounder', batting: 77, bowling: 70 },
            { name: 'Glenn Phillips', role: 'batsman', batting: 79, bowling: 20 },
            { name: 'Finn Allen', role: 'batsman', batting: 76, bowling: 15 },
            { name: 'Mark Chapman', role: 'batsman', batting: 74, bowling: 25 },
            { name: 'Tim Seifert', role: 'wicketkeeper', batting: 72, bowling: 5 },
            
            // All-rounders
            { name: 'Mitchell Santner', role: 'allrounder', batting: 68, bowling: 80 },
            { name: 'James Neesham', role: 'allrounder', batting: 71, bowling: 72 },
            { name: 'Rachin Ravindra', role: 'allrounder', batting: 69, bowling: 75 },
            { name: 'Michael Bracewell', role: 'allrounder', batting: 66, bowling: 73 },
            
            // Bowlers
            { name: 'Trent Boult', role: 'bowler', batting: 20, bowling: 86 },
            { name: 'Tim Southee', role: 'bowler', batting: 25, bowling: 85 },
            { name: 'Lockie Ferguson', role: 'bowler', batting: 15, bowling: 84 },
            { name: 'Ish Sodhi', role: 'bowler', batting: 12, bowling: 81 },
            { name: 'Matt Henry', role: 'bowler', batting: 18, bowling: 83 },
            { name: 'Adam Milne', role: 'bowler', batting: 8, bowling: 79 },
            { name: 'Blair Tickner', role: 'bowler', batting: 5, bowling: 77 },
            { name: 'Ben Sears', role: 'bowler', batting: 10, bowling: 78 }
        ]
    },
    pakistan: {
        name: 'Pakistan',
        players: [
            // Batsmen
            { name: 'Babar Azam', role: 'batsman', batting: 88, bowling: 20, captain: true },
            { name: 'Imam-ul-Haq', role: 'batsman', batting: 80, bowling: 10 },
            { name: 'Abdullah Shafique', role: 'batsman', batting: 78, bowling: 10 },
            { name: 'Fakhar Zaman', role: 'batsman', batting: 82, bowling: 15 },
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
            { name: 'Zaman Khan', role: 'bowler', batting: 7, bowling: 79 }
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
            { name: 'Dhananjaya de Silva', role: 'allrounder', batting: 74, bowling: 70 },
            { name: 'Avishka Fernando', role: 'batsman', batting: 75, bowling: 10 },
            { name: 'Sadeera Samarawickrama', role: 'wicketkeeper', batting: 73, bowling: 5 },
            { name: 'Angelo Mathews', role: 'allrounder', batting: 78, bowling: 65 },
            // All-rounders
            { name: 'Dasun Shanaka', role: 'allrounder', batting: 70, bowling: 75 },
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
            { name: 'Mahmudullah', role: 'allrounder', batting: 76, bowling: 65 },
            { name: 'Shakib Al Hasan', role: 'allrounder', batting: 80, bowling: 80 },
            { name: 'Afif Hossain', role: 'allrounder', batting: 70, bowling: 60 },
            // All-rounders
            { name: 'Mehidy Hasan Miraz', role: 'allrounder', batting: 68, bowling: 75 },
            { name: 'Mosaddek Hossain', role: 'allrounder', batting: 65, bowling: 70 },
            { name: 'Mahedi Hasan', role: 'allrounder', batting: 62, bowling: 72 },
            { name: 'Soumya Sarkar', role: 'allrounder', batting: 67, bowling: 68 },
            // Bowlers
            { name: 'Taskin Ahmed', role: 'bowler', batting: 15, bowling: 82 },
            { name: 'Mustafizur Rahman', role: 'bowler', batting: 10, bowling: 80 },
            { name: 'Shoriful Islam', role: 'bowler', batting: 8, bowling: 78 },
            { name: 'Hasan Mahmud', role: 'bowler', batting: 5, bowling: 77 },
            { name: 'Ebadot Hossain', role: 'bowler', batting: 12, bowling: 81 },
            { name: 'Nasum Ahmed', role: 'bowler', batting: 7, bowling: 79 },
            { name: 'Taijul Islam', role: 'bowler', batting: 6, bowling: 78 },
            { name: 'Khaled Ahmed', role: 'bowler', batting: 9, bowling: 77 }
        ]
    },
    // IPL TEAMS
    rcb: {
        name: 'Royal Challengers Bengaluru',
        players: [
            { name: 'Virat Kohli', role: 'batsman' },
            { name: 'Rajat Patidar', role: 'batsman' },
            { name: 'Devdutt Padikkal', role: 'batsman' },
            { name: 'Swastik Chikara', role: 'batsman' },
            { name: 'Phil Salt', role: 'wicketkeeper' },
            { name: 'Jitesh Sharma', role: 'wicketkeeper' },
            { name: 'Liam Livingstone', role: 'allrounder' },
            { name: 'Krunal Pandya', role: 'allrounder' },
            { name: 'Romario Shepherd', role: 'allrounder' },
            { name: 'Tim David', role: 'allrounder' },
            { name: 'Manoj Bhandage', role: 'allrounder' },
            { name: 'Jacob Bethell', role: 'allrounder' },
            { name: 'Mohit Rathee', role: 'allrounder' },
            { name: 'Suyash Sharma', role: 'bowler' },
            { name: 'Swapnil Singh', role: 'bowler' },
            { name: 'Yash Dayal', role: 'bowler' },
            { name: 'Rasikh Dar', role: 'bowler' },
            { name: 'Josh Hazlewood', role: 'bowler' },
            { name: 'Bhuvneshwar Kumar', role: 'bowler' },
            { name: 'Nuwan Thushara', role: 'bowler' },
            { name: 'Abhinandan Singh', role: 'bowler' },
            { name: 'Lungi Ngidi', role: 'bowler' }
        ]
    },
    csk: {
        name: 'Chennai Super Kings',
        players: [
            { name: 'Ruturaj Gaikwad', role: 'batsman', captain: true },
            { name: 'Rahul Tripathi', role: 'batsman' },
            { name: 'Devon Conway', role: 'wicketkeeper' },
            { name: 'Matheesha Pathirana', role: 'bowler' },
            { name: 'Noor Ahmad', role: 'bowler' },
            { name: 'Khaleel Ahmed', role: 'bowler' },
            { name: 'MS Dhoni', role: 'wicketkeeper' },
            { name: 'Shivam Dube', role: 'allrounder' },
            { name: 'Ravindra Jadeja', role: 'allrounder' },
            { name: 'Vijay Shankar', role: 'allrounder' },
            { name: 'Rachin Ravindra', role: 'allrounder' },
            { name: 'Ravichandran Ashwin', role: 'allrounder' },
            { name: 'Sam Curran', role: 'allrounder' },
            { name: 'Shaik Rasheed', role: 'batsman' },
            { name: 'Anshul Kamboj', role: 'allrounder' },
            { name: 'Mukesh Choudhary', role: 'bowler' },
            { name: 'Deepak Hooda', role: 'allrounder' },
            { name: 'Jamie Overton', role: 'allrounder' },
            { name: 'Gurjapneet Singh', role: 'bowler' },
            { name: 'Nathan Ellis', role: 'bowler' },
            { name: 'Kamlesh Nagarkoti', role: 'bowler' },
            { name: 'Vansh Bedi', role: 'wicketkeeper' },
            { name: 'Andre Siddarth', role: 'batsman' },
            { name: 'Shreyas Gopal', role: 'bowler' }
        ]
    },
    mi: {
        name: 'Mumbai Indians',
        players: [
            { name: 'Hardik Pandya', role: 'allrounder', captain: true },
            { name: 'Rohit Sharma', role: 'batsman' },
            { name: 'Jasprit Bumrah', role: 'bowler' },
            { name: 'Suryakumar Yadav', role: 'batsman' },
            { name: 'Tilak Varma', role: 'allrounder' },
            { name: 'Trent Boult', role: 'bowler' },
            { name: 'Karn Sharma', role: 'bowler' },
            { name: 'Robin Minz', role: 'wicketkeeper' },
            { name: 'Naman Dhir', role: 'allrounder' },
            { name: 'Ryan Rickelton', role: 'wicketkeeper' },
            { name: 'Deepak Chahar', role: 'bowler' },
            { name: 'Allah Ghazanfar', role: 'bowler' },
            { name: 'Will Jacks', role: 'batsman' },
            { name: 'Ashwani Kumar', role: 'bowler' },
            { name: 'Reece Topley', role: 'bowler' },
            { name: 'Krishnan Shrijith', role: 'wicketkeeper' },
            { name: 'Mitchell Santner', role: 'allrounder' },
            { name: 'Raj Bawa', role: 'allrounder' },
            { name: 'Satyanarayana Raju', role: 'bowler' },
            { name: 'Bevon Jacobs', role: 'batsman' },
            { name: 'Arjun Tendulkar', role: 'bowler' },
            { name: 'Vignesh Puthur', role: 'allrounder' },
            { name: 'Lizaad Williams', role: 'bowler' }
        ]
    },
    gt: {
        name: 'Gujarat Titans',
        players: [
            { name: 'Jos Buttler', role: 'wicketkeeper' },
            { name: 'Kumar Kushagra', role: 'wicketkeeper' },
            { name: 'Anuj Rawat', role: 'wicketkeeper' },
            { name: 'Shubman Gill', role: 'batsman', captain: true },
            { name: 'Sai Sudharsan', role: 'batsman' },
            { name: 'Shahrukh Khan', role: 'batsman' },
            { name: 'Sai Kishore', role: 'batsman' },
            { name: 'Mahipal Lomror', role: 'allrounder' },
            { name: 'Washington Sundar', role: 'allrounder' },
            { name: 'Nishant Sindhu', role: 'allrounder' },
            { name: 'Rashid Khan', role: 'allrounder' },
            { name: 'Rahul Tewatia', role: 'allrounder' },
            { name: 'Karim Janat', role: 'allrounder' },
            { name: 'Kagiso Rabada', role: 'bowler' },
            { name: 'Mohammed Siraj', role: 'bowler' },
            { name: 'Prasidh Krishna', role: 'bowler' },
            { name: 'Gerald Coetzee', role: 'bowler' },
            { name: 'Arshad Khan', role: 'bowler' },
            { name: 'Ishant Sharma', role: 'bowler' },
            { name: 'Gurnoor Brar', role: 'bowler' },
            { name: 'Kulwant Khejroliya', role: 'bowler' },
            { name: 'Manav Suthar', role: 'bowler' }
        ]
    },
    lsg: {
        name: 'Lucknow Super Giants',
        players: [
            { name: 'Ayush Badoni', role: 'batsman' },
            { name: 'David Miller', role: 'batsman' },
            { name: 'Aiden Markram', role: 'batsman' },
            { name: 'Himmat Singh', role: 'batsman' },
            { name: 'Nicholas Pooran', role: 'wicketkeeper' },
            { name: 'Rishabh Pant', role: 'wicketkeeper' },
            { name: 'Aryan Juyal', role: 'wicketkeeper' },
            { name: 'Abdul Samad', role: 'allrounder' },
            { name: 'Mitchell Marsh', role: 'allrounder' },
            { name: 'Arshin Kulkarni', role: 'allrounder' },
            { name: 'Yuvraj Chaudhary', role: 'allrounder' },
            { name: 'Shahbaz Ahmed', role: 'allrounder' },
            { name: 'Ravi Bishnoi', role: 'bowler' },
            { name: 'Digvesh Singh', role: 'bowler' },
            { name: 'M Siddharth', role: 'bowler' },
            { name: 'Mayank Yadav', role: 'bowler' },
            { name: 'Mohsin Khan', role: 'bowler' },
            { name: 'Avesh Khan', role: 'bowler' },
            { name: 'Akash Deep', role: 'bowler' },
            { name: 'Shamar Joseph', role: 'bowler' },
            { name: 'Prince Yadav', role: 'bowler' },
            { name: 'Rajvardhan Hangargekar', role: 'bowler' },
            { name: 'Matthew Breetzke', role: 'bowler' }
        ]
    },
    dc: {
        name: 'Dehli Capitals',
        players: [
            { name: 'Jake Fraser-McGurk', role: 'batsman' },
            { name: 'Tristan Stubbs', role: 'wicketkeeper' },
            { name: 'Faf du Plessis', role: 'batsman' },
            { name: 'Harry Brook', role: 'batsman' },
            { name: 'Karun Nair', role: 'batsman' },
            { name: 'Sameer Rizvi', role: 'batsman' },
            { name: 'Ashutosh Sharma', role: 'batsman' },
            { name: 'Donovan Ferreira', role: 'batsman' },
            { name: 'KL Rahul', role: 'wicketkeeper' },
            { name: 'Abishek Porel', role: 'wicketkeeper' },
            { name: 'Axar Patel', role: 'allrounder' },
            { name: 'Ajay Mandal', role: 'allrounder' },
            { name: 'Vipraj Nigam', role: 'allrounder' },
            { name: 'Manvath Kumar', role: 'allrounder' },
            { name: 'Madhav Tiwari', role: 'allrounder' },
            { name: 'Kuldeep Yadav', role: 'bowler' },
            { name: 'Mitchell Starc', role: 'bowler' },
            { name: 'T Natarajan', role: 'bowler' },
            { name: 'Mohit Sharma', role: 'bowler' },
            { name: 'Mukesh Kumar', role: 'bowler' },
            { name: 'Darshan Nalkande', role: 'bowler' },
            { name: 'Dushmantha Chameera', role: 'bowler' },
            { name: 'Tripurana Vijay', role: 'bowler' }
        ]
    },
    srh: {
        name: 'Sunrisers Hyderabad',
        players: [
            { name: 'Abhishek Sharma', role: 'batsman' },
            { name: 'Travis Head', role: 'batsman' },
            { name: 'Atharva Taide', role: 'batsman' },
            { name: 'Abhinav Manohar', role: 'batsman' },
            { name: 'Aniket Varma', role: 'batsman' },
            { name: 'Sachin Baby', role: 'batsman' },
            { name: 'Heinrich Klaassen', role: 'wicketkeeper' },
            { name: 'Ishan Kishan', role: 'wicketkeeper' },
            { name: 'Nitish Kumar Reddy', role: 'allrounder' },
            { name: 'Harshal Patel', role: 'allrounder' },
            { name: 'Kamindu Mendis', role: 'allrounder' },
            { name: 'Pat Cummins', role: 'bowler' },
            { name: 'Mohammed Shami', role: 'bowler' },
            { name: 'Simarjeet Singh', role: 'bowler' },
            { name: 'Jaydev Unadkat', role: 'bowler' },
            { name: 'Wiaan Mulder', role: 'allrounder' },
            { name: 'Echan Malinga', role: 'bowler' },
            { name: 'Rahul Chahar', role: 'bowler' },
            { name: 'Adam Zampa', role: 'bowler' },
            { name: 'Zeeshan Ansari', role: 'bowler' }
        ]
    },
    pbks: {
        name: 'Punjab Kings',
        players: [
            { name: 'Shreyas Iyer', role: 'batsman', captain: true },
            { name: 'Pyla Avinash', role: 'batsman' },
            { name: 'Nehal Wadhera', role: 'batsman' },
            { name: 'Priyansh Arya', role: 'batsman' },
            { name: 'Harnoor Singh', role: 'batsman' },
            { name: 'Musheer Khan', role: 'batsman' },
            { name: 'Vishnu Vinod', role: 'wicketkeeper' },
            { name: 'Josh Inglis', role: 'wicketkeeper' },
            { name: 'Prabhsimran Singh', role: 'wicketkeeper' },
            { name: 'Glenn Maxwell', role: 'allrounder' },
            { name: 'Mitchell Owen', role: 'allrounder' },
            { name: 'Marcus Stoinis', role: 'allrounder' },
            { name: 'Shashank Singh', role: 'allrounder' },
            { name: 'Aaron Hardie', role: 'allrounder' },
            { name: 'Azmatullah Omarzai', role: 'allrounder' },
            { name: 'Marco Jansen', role: 'allrounder' },
            { name: 'Suryansh Shedge', role: 'allrounder' },
            { name: 'Lockie Ferguson', role: 'bowler' },
            { name: 'Kyle Jamieson', role: 'bowler' },
            { name: 'Kuldeep Sen', role: 'bowler' },
            { name: 'Vijaykumar Vyshak', role: 'bowler' },
            { name: 'Yash Thakur', role: 'bowler' },
            { name: 'Xavier Bartlett', role: 'bowler' },
            { name: 'Arshdeep Singh', role: 'bowler' },
            { name: 'Yuzvendra Chahal', role: 'bowler' },
            { name: 'Praveen Dubey', role: 'bowler' },
            { name: 'Harpreet Brar', role: 'bowler' }
        ]
    },
    rr: {
        name: 'Rajasthan Royals',
        players: [
            { name: 'Yashasvi Jaiswal', role: 'batsman' },
            { name: 'Riyan Parag', role: 'batsman' },
            { name: 'Shimron Hetmyer', role: 'batsman' },
            { name: 'Nitish Rana', role: 'batsman' },
            { name: 'Shubham Dubey', role: 'batsman' },
            { name: 'Vaibhav Suryavanshi', role: 'batsman' },
            { name: 'Kunal Rathore', role: 'batsman' },
            { name: 'Sanju Samson', role: 'wicketkeeper' },
            { name: 'Dhruv Jurel', role: 'wicketkeeper' },
            { name: 'Wanindu Hasaranga', role: 'allrounder' },
            { name: 'Sandeep Sharma', role: 'bowler' },
            { name: 'Jofra Archer', role: 'bowler' },
            { name: 'Akash Madhwal', role: 'bowler' },
            { name: 'Tushar Deshpande', role: 'bowler' },
            { name: 'Yudhvir Singh', role: 'bowler' },
            { name: 'Fazalhaq Farooqi', role: 'bowler' },
            { name: 'Kwena Maphaka', role: 'bowler' },
            { name: 'Ashok Sharma', role: 'bowler' },
            { name: 'Maheesh Theekshana', role: 'bowler' },
            { name: 'Kumar Kartikeya', role: 'bowler' }
        ]
    },
    kkr: {
        name: 'Kolkata Knight Riders',
        players: [
            { name: 'Angkrish Raghuvanshi', role: 'batsman' },
            { name: 'Rinku Singh', role: 'batsman' },
            { name: 'Ramandeep Singh', role: 'batsman' },
            { name: 'Rovman Powell', role: 'batsman' },
            { name: 'Manish Pandey', role: 'batsman' },
            { name: 'Luvnith Sisodia', role: 'batsman' },
            { name: 'Ajinkya Rahane', role: 'batsman' },
            { name: 'Anukul Roy', role: 'batsman' },
            { name: 'Quinton de Kock', role: 'wicketkeeper' },
            { name: 'Rahmanullah Gurbaz', role: 'wicketkeeper' },
            { name: 'Moeen Ali', role: 'allrounder' },
            { name: 'Andre Russell', role: 'allrounder' },
            { name: 'Sunil Narine', role: 'allrounder' },
            { name: 'Venkatesh Iyer', role: 'allrounder' },
            { name: 'Varun Chakravarthy', role: 'bowler' },
            { name: 'Mayank Markande', role: 'bowler' },
            { name: 'Harshit Rana', role: 'bowler' },
            { name: 'Anrich Nortje', role: 'bowler' },
            { name: 'Vaibhav Arora', role: 'bowler' },
            { name: 'Spencer Johnson', role: 'bowler' },
            { name: 'Chetan Sakariya', role: 'bowler' }
        ]
    }
};

// Match type configurations
const matchConfigs = {
    t20: { overs: 20, maxWickets: 10 },
    odi: { overs: 50, maxWickets: 10 },
    test: { overs: 90, maxWickets: 10, innings: 2 }
};

// Load team data and create lineups
function loadTeam(teamNum) {
    const teamSelect = document.getElementById(`team${teamNum}`);
    const teamKey = teamSelect.value;
    
    if (!teamKey) return;
    
    const team = teams[teamKey];
    if (teamNum === 1) {
        team1Data = { ...team };
    } else {
        team2Data = { ...team };
    }
    
    document.getElementById(`team${teamNum}-name`).textContent = team.name;
    createLineup(teamNum, team);
}

// Create lineup with default players
function createLineup(teamNum, team) {
    const battingContainer = document.getElementById(`team${teamNum}-batting`);
    const bowlingContainer = document.getElementById(`team${teamNum}-bowling`);
    
    // Clear existing lineups
    battingContainer.innerHTML = '';
    bowlingContainer.innerHTML = '';
    
    // Get best 11 players (mix of batsmen, all-rounders, and bowlers)
    const bestPlayers = getBestEleven(team.players);
    
    // Create batting order (first 11)
    for (let i = 1; i <= 11; i++) {
        const playerSlot = document.createElement('div');
        playerSlot.className = 'player-slot';
        
        const label = document.createElement('label');
        label.textContent = `${i}. `;
        
        const select = document.createElement('select');
        select.id = `team${teamNum}-bat-${i}`;
        
        // Add options
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select Player';
        select.appendChild(defaultOption);
        
        team.players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.name;
            option.textContent = `${player.name} (${player.role})`;
            select.appendChild(option);
        });
        
        // Set default player
        if (bestPlayers[i - 1]) {
            select.value = bestPlayers[i - 1].name;
        }
        
        playerSlot.appendChild(label);
        playerSlot.appendChild(select);
        battingContainer.appendChild(playerSlot);
    }
    
    // Create bowling order (shows top bowlers from batting lineup)
    const bowlingInfo = document.createElement('div');
    bowlingInfo.className = 'bowling-info';
    bowlingInfo.innerHTML = '<p><em>Bowling order will be automatically selected from the batting lineup (minimum 3 bowlers)</em></p>';
    bowlingContainer.appendChild(bowlingInfo);
}

// Get best 11 players for a team (batsmen first, then all-rounders, then bowlers)
function getBestEleven(players) {
    // Separate by role
    const batsmen = players.filter(p => p.role === 'batsman' || p.role === 'wicketkeeper').sort((a, b) => b.batting - a.batting);
    const allrounders = players.filter(p => p.role === 'allrounder').sort((a, b) => (b.batting + b.bowling) - (a.batting + a.bowling));
    const bowlers = players.filter(p => p.role === 'bowler').sort((a, b) => b.bowling - a.bowling);

    let selectedBatsmen = [];
    let selectedAllrounders = [];
    let selectedBowlers = [];

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
    for (let i = 0; i < batsmen.length && (selectedBatsmen.length + selectedAllrounders.length + selectedBowlers.length) < 11; i++) {
        if (!used.has(batsmen[i].name)) {
            selectedBatsmen.push(batsmen[i]);
            used.add(batsmen[i].name);
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
    // Return in order: batsmen, allrounders, bowlers
    return [...selectedBatsmen, ...selectedAllrounders, ...selectedBowlers].slice(0, 11);
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

// Simulate a match
function simulateMatch() {
    if (!team1Data || !team2Data) {
        alert('Please select both teams first!');
        return;
    }
    // Prevent simulation when both teams are the same
    if (team1Data.name === team2Data.name) {
        alert('Please select different teams for the match!');
        return;
    }
    // Validate lineups for both teams
    const team1Lineup = getBattingLineup(team1Data, 1);
    const team2Lineup = getBattingLineup(team2Data, 2);
    if (!validateLineup(team1Lineup)) {
        alert('Team 1 lineup must have at least 3 bowlers (excluding allrounders), at least 5 bowlers+allrounders, and at least 1 allrounder.');
        return;
    }
    if (!validateLineup(team2Lineup)) {
        alert('Team 2 lineup must have at least 3 bowlers (excluding allrounders), at least 5 bowlers+allrounders, and at least 1 allrounder.');
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
        
        const secondInnings = simulateInnings(secondBattingTeam, firstBattingTeam, config, 2, firstInnings.total);
        matchResults.team2.innings.push(secondInnings);
        
        // Second innings (chase logic only applies to 4th innings)
        const thirdInnings = simulateInnings(firstBattingTeam, secondBattingTeam, config, 3, secondInnings.total);
        matchResults.team1.innings.push(thirdInnings);
        
        const fourthInnings = simulateInnings(secondBattingTeam, firstBattingTeam, config, 4, firstInnings.total + thirdInnings.total);
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
    
    displayResults();
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
            economy: 0
        };
    });
    let currentBatsman1 = 0;
    let currentBatsman2 = 1;
    let currentBowler = 0;
    let ballsInOver = 0;
    let overRuns = 0;
    for (let over = 0; over < config.overs && innings.wickets < config.maxWickets; over++) {
        overRuns = 0;
        // Enforce T20/ODI over cap per bowler
        if (currentMatchType === 't20' || currentMatchType === 'odi') {
            let maxBalls = currentMatchType === 't20' ? 24 : 60;
            let attempts = 0;
            while (bowlerStats[bowlingLineup[currentBowler].name].balls >= maxBalls && attempts < bowlingLineup.length) {
                currentBowler = (currentBowler + 1) % bowlingLineup.length;
                attempts++;
            }
        }
        for (let ball = 0; ball < 6 && innings.wickets < config.maxWickets; ball++) {
            // For T20/ODI, check before every ball
            if (currentMatchType === 't20' || currentMatchType === 'odi') {
                let maxBalls = currentMatchType === 't20' ? 24 : 60;
                let attempts = 0;
                while (bowlerStats[bowlingLineup[currentBowler].name].balls >= maxBalls && attempts < bowlingLineup.length) {
                    currentBowler = (currentBowler + 1) % bowlingLineup.length;
                    attempts++;
                }
            }
            const batsman = battingLineup[currentBatsman1];
            const bowler = bowlingLineup[currentBowler];
            const outcome = calculateBallOutcome(batsman, bowler);
            let runs = 0;
            if (outcome === 'out') {
                innings.batting[currentBatsman1].dismissal = getRandomDismissal(batsman, bowler, bowlingLineup);
                innings.wickets++;
                bowlerStats[bowler.name].wickets++;
                currentBatsman1 = Math.max(currentBatsman1, currentBatsman2) + 1;
                if (currentBatsman1 >= battingLineup.length) break;
            } else if (['1','2','3','4','6'].includes(outcome)) {
                runs = parseInt(outcome);
                if (target && ((currentMatchType !== 'test') || (currentMatchType === 'test' && inningsNum === 4)) && (innings.total + runs) >= target) {
                    runs = target - innings.total;
                }
                innings.batting[currentBatsman1].runs += runs;
                innings.batting[currentBatsman1].balls++;
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
                continue; // Don't increment balls for extras
            }
            // Increment balls for legal deliveries
            bowlerStats[bowler.name].balls = (bowlerStats[bowler.name].balls || 0) + 1;
            bowlerStats[bowler.name].overs = ((over * 6 + ball + 1) / 6).toFixed(1);
            // Check if target reached (chase logic)
            if (target && ((currentMatchType !== 'test') || (currentMatchType === 'test' && inningsNum === 4)) && innings.total >= target) {
                innings.targetReached = true;
                break;
            }
        }
        // Maiden check
        if (overRuns === 0) {
            bowlerStats[bowlingLineup[currentBowler].name].maidens++;
        }
        // Change bowler every N overs
        if ((currentMatchType === 'odi' && (over + 1) % 5 === 0) || (currentMatchType !== 'odi' && (over + 1) % 4 === 0)) {
            currentBowler = (currentBowler + 1) % bowlingLineup.length;
        }
        innings.overs = over + 1;
        if (target && ((currentMatchType !== 'test') || (currentMatchType === 'test' && inningsNum === 4)) && innings.total >= target) break;
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
    for (let i = 1; i <= 11; i++) {
        const select = document.getElementById(`team${teamNum}-bat-${i}`);
        if (select && select.value) {
            const player = team.players.find(p => p.name === select.value);
            if (player) lineup.push(player);
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

// Calculate ball outcome based on player skills
function calculateBallOutcome(batsman, bowler) {
    const battingSkill = batsman.batting;
    const bowlingSkill = bowler.bowling;

    // Format-based scoring rates (reduced by 8%)
    let outProb, boundaryProb, dotProb, run1Prob, run2Prob, run3Prob;
    if (currentMatchType === 'test') {
        outProb = 0.844 * Math.max(0.015, Math.min(0.09, (bowlingSkill - battingSkill + 30) / 350));
        boundaryProb = 0.92 * Math.max(0.03, (battingSkill - 60) / 180);
        dotProb = 0.92 * Math.max(0.25, (bowlingSkill - battingSkill + 40) / 90);
        run1Prob = 0.92 * 0.60;
        run2Prob = 0.92 * 0.20;
        run3Prob = 0.92 * 0.10;
    } else if (currentMatchType === 'odi') {
        outProb = Math.max(0.012, Math.min(0.08, (bowlingSkill - battingSkill + 30) / 370));
        outProb *= 0.6764678; // Reduce wicket probability by 22.3532%
        boundaryProb = 0.92 * Math.max(0.045, (battingSkill - 55) / 140);
        dotProb = 0.92 * Math.max(0.18, (bowlingSkill - battingSkill + 30) / 100);
        run1Prob = 0.92 * 0.50;
        run2Prob = 0.92 * 0.25;
        run3Prob = 0.92 * 0.17;
    } else {
        outProb = Math.max(0.01, Math.min(0.07, (bowlingSkill - battingSkill + 30) / 400));
        boundaryProb = 0.92 * Math.max(0.06, (battingSkill - 50) / 100);
        dotProb = 0.92 * Math.max(0.13, (bowlingSkill - battingSkill + 20) / 110);
        run1Prob = 0.92 * 0.45;
        run2Prob = 0.92 * 0.25;
        run3Prob = 0.92 * 0.20;
    }
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
    
    // Create batting scorecards
    if (currentMatchType === 'test') {
        // Test match: show combined batting stats from both innings
        const team1CombinedBatting = combineInningsBatting(matchResults.team1.innings);
        const team2CombinedBatting = combineInningsBatting(matchResults.team2.innings);
        
        createBattingScorecard('team1-batting-scorecard', matchResults.team1.name, team1CombinedBatting);
        createBattingScorecard('team2-batting-scorecard', matchResults.team2.name, team2CombinedBatting);
        
        // Create bowling scorecards (combined from both innings)
        const team1CombinedBowling = combineInningsBowling(matchResults.team2.innings);
        const team2CombinedBowling = combineInningsBowling(matchResults.team1.innings);
        
        createBowlingScorecard('team1-bowling-scorecard', matchResults.team2.name, team1CombinedBowling);
        createBowlingScorecard('team2-bowling-scorecard', matchResults.team1.name, team2CombinedBowling);
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
    
    document.getElementById('team1').value = '';
    document.getElementById('team2').value = '';
    document.getElementById('team1-name').textContent = 'Team 1';
    document.getElementById('team2-name').textContent = 'Team 2';
    
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
    document.getElementById('tournament-panel').style.display = panel === 'tournament' ? 'block' : 'none';
    document.getElementById('single-tab').classList.toggle('active', panel === 'single');
    document.getElementById('tournament-tab').classList.toggle('active', panel === 'tournament');
    if (panel === 'tournament') {
        renderTournamentTeamSelectors();
    }
}

function renderTournamentTeamSelectors() {
    const size = parseInt(document.querySelector('input[name="tournament-size"]:checked').value);
    const selectorDiv = document.getElementById('tournament-team-selectors');
    selectorDiv.innerHTML = '';
    const teamKeys = [
        'india','australia','england','southafrica','newzealand','pakistan','srilanka','bangladesh',
        'rcb','csk','mi','gt','lsg','dc','srh','pbks','rr','kkr'
    ];
    for (let i = 0; i < size; i++) {
        const selDiv = document.createElement('div');
        selDiv.className = 'tournament-team-selector';
        const label = document.createElement('label');
        label.textContent = `Team ${i+1}`;
        const select = document.createElement('select');
        select.id = `tournament-team-${i}`;
        select.onchange = () => preventDuplicateTournamentTeams();
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = 'Select Team';
        select.appendChild(defaultOpt);
        teamKeys.forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = teams[key].name;
            select.appendChild(opt);
        });
        selDiv.appendChild(label);
        selDiv.appendChild(select);
        selectorDiv.appendChild(selDiv);
    }
}

function preventDuplicateTournamentTeams() {
    const size = parseInt(document.querySelector('input[name="tournament-size"]:checked').value);
    const selected = [];
    for (let i = 0; i < size; i++) {
        const val = document.getElementById(`tournament-team-${i}`).value;
        if (val) selected.push(val);
    }
    for (let i = 0; i < size; i++) {
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
    const size = parseInt(document.querySelector('input[name="tournament-size"]:checked').value);
    // Get selected format
    const format = document.querySelector('input[name="tournament-format"]:checked').value;
    const selectedTeams = [];
    for (let i = 0; i < size; i++) {
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
        size,
        teams: shuffled,
        round: 0,
        matches: [],
        results: [],
        winner: null,
        matchData: {}, // Store full match data for scorecard
        format // Store selected format
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
    const rounds = Math.log2(tournamentState.size);
    let currentTeams = tournamentState.teams.slice();
    let roundWinners = [];
    let matchIdx = 0;
    for (let r = 0; r < rounds; r++) {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'bracket-round';
        const roundMatches = [];
        for (let i = 0; i < currentTeams.length; i += 2) {
            const teamA = teams[currentTeams[i]].name;
            const teamB = teams[currentTeams[i+1]].name;
            const matchDiv = document.createElement('div');
            matchDiv.className = 'bracket-match';
            let matchResult = tournamentState.results[matchIdx];
            let matchData = tournamentState.matchData ? tournamentState.matchData[matchIdx] : null;
            if (matchResult && matchData) {
                matchDiv.classList.add('bracket-winner');
                // Show scores for both teams next to their names, and a separate scorecard button
                let teamAScore = `${matchData.firstInnings.total}/${matchData.firstInnings.wickets} (${matchData.firstInnings.overs} ov)`;
                let teamBScore = `${matchData.secondInnings.total}/${matchData.secondInnings.wickets} (${matchData.secondInnings.overs} ov)`;
                matchDiv.innerHTML = `<span>${teamA} <span style='color:#4f46e5;font-weight:600;'>${teamAScore}</span> vs ${teamB} <span style='color:#4f46e5;font-weight:600;'>${teamBScore}</span></span><br><strong>Winner: ${matchResult}</strong><br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;background:#667eea;' onclick='showTournamentScorecard(${matchIdx})'>View Scorecard</button>`;
                roundWinners.push(matchResult === teamA ? currentTeams[i] : currentTeams[i+1]);
            } else {
                matchDiv.innerHTML = `<span>${teamA} vs ${teamB}</span><br><button class='simulate-btn' style='margin-top:8px;padding:6px 18px;font-size:0.98rem;' onclick='simulateTournamentMatch(${matchIdx},"${currentTeams[i]}","${currentTeams[i+1]}")'>Simulate</button>`;
            }
            roundDiv.appendChild(matchDiv);
            roundMatches.push([currentTeams[i], currentTeams[i+1]]);
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
    // Simulate a single match between teamA and teamB using the selected format
    const teamA = teams[teamAKey];
    const teamB = teams[teamBKey];
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
        firstKey = tossWinner === teamA ? teamAKey : teamBKey;
        secondKey = tossWinner === teamA ? teamBKey : teamAKey;
    } else {
        firstBat = tossWinner === teamA ? teamB : teamA;
        secondBat = tossWinner === teamA ? teamA : teamB;
        firstKey = tossWinner === teamA ? teamBKey : teamAKey;
        secondKey = tossWinner === teamA ? teamAKey : teamBKey;
    }
    // Use selected format
    const format = tournamentState.format || 't20';
    const config = matchConfigs[format];
    const firstInnings = simulateTournamentInningsWithScorecard(firstBat, secondBat, config);
    const secondInnings = simulateTournamentInningsWithScorecard(secondBat, firstBat, config, firstInnings.total);
    let winner;
    if (secondInnings.total > firstInnings.total) {
        winner = secondBat.name;
    } else if (firstInnings.total > secondInnings.total) {
        winner = firstBat.name;
    } else {
        // If tied, chasing team wins 50.3% of the time
        winner = Math.random() < 0.503 ? secondBat.name : firstBat.name;
    }
    // Store full match data for scorecard
    if (!tournamentState.matchData) tournamentState.matchData = {};
    tournamentState.matchData[matchIdx] = {
        teamAKey, teamBKey,
        firstBatKey: firstKey, secondBatKey: secondKey,
        firstBatName: firstBat.name, secondBatName: secondBat.name,
        tossWinner: tossWinner.name, tossDecision,
        firstInnings, secondInnings,
        winner,
        format // Store format for scorecard display
    };
    tournamentState.results[matchIdx] = winner;
    // If this was the last match, set champion
    const totalMatches = tournamentState.size - 1;
    if (tournamentState.results.length === totalMatches && !tournamentState.results.includes(undefined)) {
        tournamentState.winner = Object.keys(teams).find(k => teams[k].name === winner);
    }
    renderTournamentBracket();
}

function simulateTournamentInningsWithScorecard(battingTeam, bowlingTeam, config, target = null) {
    const battingLineup = getBestEleven(battingTeam.players);
    const bowlingLineup = getBestEleven(bowlingTeam.players).filter(p => p.bowling > 50).slice(0, 6);
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
            economy: 0
        };
    });
    let currentBatsman1 = 0;
    let currentBatsman2 = 1;
    let currentBowler = 0;
    let overRuns = 0;
    for (let over = 0; over < config.overs && innings.wickets < config.maxWickets; over++) {
        overRuns = 0;
        // Enforce T20/ODI over cap per bowler
        if (currentMatchType === 't20' || currentMatchType === 'odi') {
            let maxBalls = currentMatchType === 't20' ? 24 : 60;
            let attempts = 0;
            while (bowlerStats[bowlingLineup[currentBowler].name].balls >= maxBalls && attempts < bowlingLineup.length) {
                currentBowler = (currentBowler + 1) % bowlingLineup.length;
                attempts++;
            }
        }
        for (let ball = 0; ball < 6 && innings.wickets < config.maxWickets; ball++) {
            // For T20/ODI, check before every ball
            if (currentMatchType === 't20' || currentMatchType === 'odi') {
                let maxBalls = currentMatchType === 't20' ? 24 : 60;
                let attempts = 0;
                while (bowlerStats[bowlingLineup[currentBowler].name].balls >= maxBalls && attempts < bowlingLineup.length) {
                    currentBowler = (currentBowler + 1) % bowlingLineup.length;
                    attempts++;
                }
            }
            const batsman = battingLineup[currentBatsman1];
            const bowler = bowlingLineup[currentBowler];
            const outcome = calculateBallOutcome(batsman, bowler);
            let runs = 0;
            if (outcome === 'out') {
                innings.batting[currentBatsman1].dismissal = getRandomDismissal(batsman, bowler, bowlingLineup, true);
                innings.wickets++;
                bowlerStats[bowler.name].wickets++;
                currentBatsman1 = Math.max(currentBatsman1, currentBatsman2) + 1;
                if (currentBatsman1 >= battingLineup.length) break;
            } else if (['1','2','3','4','6'].includes(outcome)) {
                runs = parseInt(outcome);
                if (target && (innings.total + runs) >= target) {
                    runs = target - innings.total;
                }
                innings.batting[currentBatsman1].runs += runs;
                innings.batting[currentBatsman1].balls++;
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
                continue; // Don't increment balls for extras
            }
            // Increment balls for legal deliveries
            bowlerStats[bowler.name].balls = (bowlerStats[bowler.name].balls || 0) + 1;
            bowlerStats[bowler.name].overs = ((over * 6 + ball + 1) / 6).toFixed(1);
            if (target && innings.total >= target) {
                innings.targetReached = true;
                break;
            }
        }
        if (overRuns === 0) {
            bowlerStats[bowlingLineup[currentBowler].name].maidens++;
        }
        // Change bowler every N overs
        if ((currentMatchType === 'odi' && (over + 1) % 5 === 0) || (currentMatchType !== 'odi' && (over + 1) % 4 === 0)) {
            currentBowler = (currentBowler + 1) % bowlingLineup.length;
        }
        innings.overs = over + 1;
        if (target && innings.total >= target) break;
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
    html += `<div style='margin-bottom:8px;text-align:center;font-size:1.05rem;'>Toss: <b>${match.tossWinner}</b> chose to <b>${match.tossDecision === 'bat' ? 'bat first' : 'bowl first'}</b></div>`;
    html += `<div class='scorecard-section'><h4>${match.firstBatName} Batting</h4>` + renderScorecardTable(match.firstInnings.batting, true) + `</div>`;
    html += `<div class='scorecard-section'><h4>${match.secondBatName} Batting</h4>` + renderScorecardTable(match.secondInnings.batting, true) + `</div>`;
    html += `<div class='scorecard-section'><h4>${match.firstBatName} Bowling</h4>` + renderScorecardTable(match.firstInnings.bowling, false) + `</div>`;
    html += `<div class='scorecard-section'><h4>${match.secondBatName} Bowling</h4>` + renderScorecardTable(match.secondInnings.bowling, false) + `</div>`;
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
        dismissal = `bowled`;
    } else if (r < 0.45) {
        dismissal = `caught`;
    } else if (r < 0.60) {
        dismissal = `lbw`;
    } else if (r < 0.70) {
        dismissal = `run out`;
    } else if (r < 0.85) {
        dismissal = `stumped`;
    } else {
        dismissal = `hit wicket`;
    }
    return dismissal;
}
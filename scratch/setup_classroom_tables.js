const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function setupClassroom() {
  try {
    console.log('Creating classroom tables...');

    // 1. Subjects table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS classroom_subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_code VARCHAR(30) NOT NULL UNIQUE,
        subject_name VARCHAR(150) NOT NULL,
        branch VARCHAR(100) NOT NULL,
        semester VARCHAR(20) NOT NULL,
        faculty_name VARCHAR(100) DEFAULT 'Prof. Dr. S. R. Jena',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 2. Notes table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS classroom_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_id INT NOT NULL,
        unit_name VARCHAR(100) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        file_url VARCHAR(500) NOT NULL,
        file_type VARCHAR(20) DEFAULT 'PDF',
        file_size VARCHAR(50) DEFAULT '2.4 MB',
        download_count INT DEFAULT 0,
        uploaded_by VARCHAR(100) DEFAULT 'Department Faculty',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_subj (subject_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3. Doubts table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS classroom_doubts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_id INT NOT NULL,
        student_name VARCHAR(120) NOT NULL,
        roll_number VARCHAR(50) DEFAULT 'BEC26000',
        question_title VARCHAR(250) NOT NULL,
        question_details TEXT NOT NULL,
        upvotes INT DEFAULT 0,
        status ENUM('OPEN', 'RESOLVED') DEFAULT 'OPEN',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_doubt_subj (subject_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 4. Doubt Replies table
    await db.pool.query(`
      CREATE TABLE IF NOT EXISTS classroom_doubt_replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doubt_id INT NOT NULL,
        author_name VARCHAR(120) NOT NULL,
        author_role VARCHAR(50) DEFAULT 'Faculty',
        reply_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_reply_doubt (doubt_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('Classroom tables created successfully!');

    // Seed sample subjects if empty
    const [subCount] = await db.pool.query('SELECT COUNT(*) as count FROM classroom_subjects');
    if (subCount[0].count === 0) {
      console.log('Seeding classroom subjects...');
      await db.pool.query(`
        INSERT INTO classroom_subjects (subject_code, subject_name, branch, semester, faculty_name)
        VALUES 
        ('CS301', 'Data Structures & Algorithms', 'Computer Science Engineering', 'Semester 5', 'Prof. Dr. S. R. Jena'),
        ('CS302', 'Database Management Systems', 'Computer Science Engineering', 'Semester 5', 'Prof. M. K. Pattanaik'),
        ('CS303', 'Operating Systems & Architecture', 'Computer Science Engineering', 'Semester 5', 'Prof. Rashmi Rekha Dash'),
        ('CS304', 'Cloud Computing & DevOps', 'CSE (Data Science)', 'Semester 7', 'Prof. Alok Kumar Mohanty'),
        ('CE201', 'Structural Mechanics & Analysis', 'Civil Engineering', 'Semester 3', 'Prof. B. C. Panda'),
        ('ME202', 'Thermodynamics & Heat Transfer', 'Mechanical Engineering', 'Semester 3', 'Prof. K. C. Tripathy')
      `);

      // Seed lecture notes
      console.log('Seeding classroom lecture notes...');
      await db.pool.query(`
        INSERT INTO classroom_notes (subject_id, unit_name, title, description, file_url, file_type, file_size, download_count, uploaded_by)
        VALUES 
        (1, 'Unit 1: Linear Data Structures', 'Stacks, Queues and Doubly Linked Lists Handout', 'Comprehensive lecture notes covering memory representations, pointer mechanics, and algorithmic complexity proofs.', 'https://res.cloudinary.com/bec-campus/raw/upload/v1/notes/CS301_Unit1_DSA.pdf', 'PDF', '3.8 MB', 142, 'Prof. Dr. S. R. Jena'),
        (1, 'Unit 2: Non-Linear Structures', 'Binary Search Trees & AVL Balancing Mechanics', 'Detailed diagrams and step-by-step tree rotation algorithms with C++ & Java implementations.', 'https://res.cloudinary.com/bec-campus/raw/upload/v1/notes/CS301_Unit2_Trees.pdf', 'PDF', '4.2 MB', 198, 'Prof. Dr. S. R. Jena'),
        (1, 'Unit 3: Graph Algorithms', 'Dijkstra & Floyd-Warshall Shortest Path Lab Manual', 'Complete laboratory exercises with test cases, edge weights, and adjacency matrices.', 'https://res.cloudinary.com/bec-campus/raw/upload/v1/notes/CS301_Unit3_Graphs.pdf', 'PDF', '2.6 MB', 87, 'Prof. Dr. S. R. Jena'),
        (2, 'Unit 1: Relational Model', 'Relational Algebra & Normalization (1NF to BCNF)', 'Formal definitions of functional dependencies, loss-less decomposition, and dependency preservation.', 'https://res.cloudinary.com/bec-campus/raw/upload/v1/notes/CS302_Unit1_DBMS.pdf', 'PDF', '5.1 MB', 165, 'Prof. M. K. Pattanaik'),
        (2, 'Unit 2: Transaction Management', 'ACID Properties & Two-Phase Locking Protocol', 'Concurrency control, schedule serializability, and deadlock detection algorithms.', 'https://res.cloudinary.com/bec-campus/raw/upload/v1/notes/CS302_Unit2_Transactions.pdf', 'PDF', '3.4 MB', 121, 'Prof. M. K. Pattanaik'),
        (4, 'Unit 1: Virtualization & Containers', 'Docker & Kubernetes Core Architecture Guide', 'Container isolation, cgroups, namespaces, pod lifecycle, and cluster deployment topologies.', 'https://res.cloudinary.com/bec-campus/raw/upload/v1/notes/CS304_Unit1_Cloud.pdf', 'PDF', '6.8 MB', 210, 'Prof. Alok Kumar Mohanty')
      `);

      // Seed student doubts
      console.log('Seeding student doubts & faculty answers...');
      const [d1] = await db.pool.query(`
        INSERT INTO classroom_doubts (subject_id, student_name, roll_number, question_title, question_details, upvotes, status)
        VALUES 
        (1, 'Simran Priyadarshinee Sahoo', 'BEC26019', 'Difference between AVL tree rotations and Red-Black tree recoloring in worst case search?', 'In AVL trees, the balance factor is strictly within [-1, 1], leading to faster search time, but does Red-Black tree balance faster during frequent insertions and deletions?', 18, 'RESOLVED'),
        (1, 'Deepak Kumar Kabi', 'BEC26022', 'Time complexity proof for Dijkstra algorithm when using Fibonacci Heap vs Min-Heap array?', 'Why does Fibonacci Heap reduce the decrease-key operation to amortized O(1) time compared to standard binary heap?', 14, 'OPEN'),
        (2, 'Mamata Mohanta', 'BEC26018', 'How to identify 3NF vs BCNF violation when multiple candidate keys overlap?', 'If a relation has composite candidate keys (A, B) and (B, C), how do we test non-prime attributes dependency for 3NF compliance?', 22, 'RESOLVED')
      `);

      // Seed faculty replies
      await db.pool.query(`
        INSERT INTO classroom_doubt_replies (doubt_id, author_name, author_role, reply_text)
        VALUES 
        (1, 'Prof. Dr. S. R. Jena', 'Senior Faculty & HOD', 'Excellent question, Simran! You are correct: AVL trees are more rigidly balanced (height <= 1.44 log n), giving faster lookups. However, Red-Black trees require at most 2 rotations per insertion and 3 per deletion, making them far superior for high-throughput write-heavy workloads like Linux kernel schedulers (CFS).'),
        (3, 'Prof. M. K. Pattanaik', 'Faculty Mentor', 'Mamata, check the third condition of 3NF: for any non-trivial dependency X -> Y, either X is a superkey OR Y is a prime attribute. In BCNF, the second relaxation (Y is prime) is removed. Refer to slide 34 of Unit 1 notes for the classic (StudentID, Subject, Teacher) example!')
      `);

      console.log('Seeded sample classroom content successfully!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Setup error:', err);
    process.exit(1);
  }
}

setupClassroom();

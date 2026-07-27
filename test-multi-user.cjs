const axios = require('axios');

const API_BASE = 'http://localhost:3000';

const TEST_USERS = [
  { email: 'test1@example.com', password: 'tester', name: 'test1' },
  { email: 'test2@example.com', password: 'tester', name: 'test2' },
  { email: 'test3@example.com', password: 'tester', name: 'test3' },
];

const TEST_URLS = [
  'https://www.w3.org/WAI/',
  'https://www.a11yproject.com/',
  'https://developer.mozilla.org/en-US/docs/Web/Accessibility',
  'https://webaim.org/',
  'https://www.accessibility.net/',
  'https://www.deque.com/',
  'https://axesslab.com/',
  'https://www.levelaccess.com/',
];

async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
    return response.data.accessToken;
  } catch (error) {
    console.error(`❌ Login failed for ${email}:`, error.response?.data?.message || error.message);
    throw error;
  }
}

async function createScanTask(token, url, maxPages = 1) {
  try {
    const response = await axios.post(`${API_BASE}/api/v1/scanner/static`, {
      url,
      maxPages,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error(`❌ Failed to create scan task for ${url}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function getTaskStatus(token, taskId) {
  try {
    const response = await axios.get(`${API_BASE}/api/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error(`❌ Failed to get task status for ${taskId}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function getQueueStatus() {
  try {
    const response = await axios.get(`${API_BASE}/api/v1/tasks/queue/status`);
    return response.data.data;
  } catch (error) {
    console.error(`❌ Failed to get queue status:`, error.response?.data?.message || error.message);
    return null;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runUserTasks(user, urls, tasksPerUser) {
  const results = [];
  const token = await login(user.email, user.password);
  console.log(`✅ ${user.name} logged in successfully`);

  const selectedUrls = urls.slice(0, tasksPerUser);
  
  const createPromises = selectedUrls.map(async (url) => {
    const task = await createScanTask(token, url);
    if (task) {
      console.log(`   📋 ${user.name} created task: ${task.taskId} for ${url}`);
      return { user: user.name, taskId: task.taskId, url, status: task.status };
    }
    return null;
  });

  const createdTasks = (await Promise.all(createPromises)).filter(Boolean);
  results.push(...createdTasks);

  return { user, token, tasks: createdTasks };
}

async function waitForTasks(tokensByUser, allTasks, timeoutMinutes = 10) {
  const startTime = Date.now();
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const completedTasks = new Set();

  console.log('\n⏳ Waiting for tasks to complete...');

  while (completedTasks.size < allTasks.length) {
    if (Date.now() - startTime > timeoutMs) {
      console.log('⏰ Timeout reached!');
      break;
    }

    const statusPromises = allTasks.map(async (task) => {
      if (completedTasks.has(task.taskId)) return;

      const token = tokensByUser[task.user];
      const status = await getTaskStatus(token, task.taskId);
      
      if (status && ['completed', 'failed', 'cancelled'].includes(status.status)) {
        completedTasks.add(task.taskId);
        const statusIcon = status.status === 'completed' ? '✅' : status.status === 'failed' ? '❌' : '⏭️';
        console.log(`   ${statusIcon} Task ${task.taskId} (${task.user}): ${status.status}`);
        
        if (status.status === 'completed' && status.result) {
          const violations = status.result.violations || [];
          console.log(`      📊 Found ${violations.length} accessibility issues`);
        }
      }
    });

    await Promise.all(statusPromises);
    
    if (completedTasks.size < allTasks.length) {
      await delay(3000);
      const queueStatus = await getQueueStatus();
      if (queueStatus) {
        console.log(`   📊 Queue: ${queueStatus.pendingCount} pending, ${queueStatus.processingCount} processing`);
      }
    }
  }

  return completedTasks.size;
}

async function main() {
  console.log('🚀 Starting Multi-User Multi-Task Test\n');

  const config = {
    users: TEST_USERS.length,
    tasksPerUser: 3,
  };

  console.log(`📋 Test Configuration:`);
  console.log(`   - Users: ${config.users}`);
  console.log(`   - Tasks per user: ${config.tasksPerUser}`);
  console.log(`   - Total tasks: ${config.users * config.tasksPerUser}\n`);

  console.log('🔐 Logging in users and creating tasks...');
  
  const startTime = Date.now();
  const userResults = await Promise.all(
    TEST_USERS.map(user => runUserTasks(user, TEST_URLS, config.tasksPerUser))
  );

  const tokensByUser = {};
  const allTasks = [];
  
  userResults.forEach(result => {
    tokensByUser[result.user.name] = result.token;
    allTasks.push(...result.tasks);
  });

  const creationTime = Date.now() - startTime;
  console.log(`\n✅ Created ${allTasks.length} tasks in ${(creationTime / 1000).toFixed(2)} seconds`);

  await delay(2000);
  
  const queueStatus = await getQueueStatus();
  if (queueStatus) {
    console.log('\n📊 Initial Queue Status:');
    console.log(`   - Pending: ${queueStatus.pendingCount}`);
    console.log(`   - Processing: ${queueStatus.processingCount}`);
    console.log(`   - Max Concurrent: ${queueStatus.maxConcurrent}`);
  }

  const completedCount = await waitForTasks(tokensByUser, allTasks);

  const totalTime = Date.now() - startTime;
  console.log('\n📈 Test Results:');
  console.log(`   - Total tasks created: ${allTasks.length}`);
  console.log(`   - Tasks completed: ${completedCount}`);
  console.log(`   - Total time: ${(totalTime / 1000 / 60).toFixed(2)} minutes`);
  console.log(`   - Average time per task: ${(totalTime / allTasks.length / 1000).toFixed(2)} seconds`);

  const taskByUser = {};
  allTasks.forEach(task => {
    if (!taskByUser[task.user]) taskByUser[task.user] = 0;
    taskByUser[task.user]++;
  });

  console.log('\n👥 Tasks per user:');
  Object.entries(taskByUser).forEach(([user, count]) => {
    console.log(`   - ${user}: ${count} tasks`);
  });

  console.log('\n🎉 Test completed!');
}

main().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
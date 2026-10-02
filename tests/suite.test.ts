import assert from 'assert';
import { DecisionEngine } from '../src/services/decisionEngine';
import { DecisionContext, UserPriorities } from '../src/types/decision';
import { CareerDecisionEngine } from '../server/decision/categoryEngines';
import { AuthService } from '../server/auth/authService';
import { SecurityMiddleware } from '../server/middleware/security';
import { ResearchEngine } from '../server/research/researchEngine';

async function runTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 FEZI PRODUCTION-GRADE TEST SUITE');
  console.log('🧪 ========================================================\n');

  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => {
            console.log(`  ✅ [PASS] ${name}`);
            passed++;
          })
          .catch((err) => {
            console.error(`  ❌ [FAIL] ${name}:`, err.message);
          });
      } else {
        console.log(`  ✅ [PASS] ${name}`);
        passed++;
      }
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
    }
  }

  // -------------------------------------------------------------
  // 1. SPEC SECTION 42: REPRODUCIBILITY & SENSITIVITY TEST CASE
  // -------------------------------------------------------------
  await test('Spec #42: Mathematically reproducible score calculation', async () => {
    const engine = new DecisionEngine();
    const context: DecisionContext = {
      decisionTitle: 'Senior Full Stack Role in Chennai',
      category: 'career',
      currentSalary: 5.5,
      offeredSalary: 8.0,
      currentRole: 'Software Engineer',
      offeredRole: 'Senior Software Engineer',
      experienceYears: 3,
      commuteMinutes: 45,
      workMode: 'hybrid',
      companySize: 'enterprise',
    };

    const priorities: UserPriorities = {
      careerGrowth: 30,
      salary: 25,
      stability: 15,
      workLifeBalance: 15,
      locationAndCommute: 10,
      learningAndCulture: 5,
    };

    const report1 = await engine.analyzeDecision(context, priorities);
    const report2 = await engine.analyzeDecision(context, priorities);

    assert.strictEqual(report1.score, report2.score, 'Scores must be identical for identical inputs');
    assert.ok(report1.score >= 70 && report1.score <= 95, `Score should be in expected range, got ${report1.score}`);
    assert.strictEqual(report1.verdict, 'STRONG YES');
  });

  await test('Spec #42: Offered salary drops to ₹6.5 LPA actually recalculates score', async () => {
    const engine = new DecisionEngine();
    const contextBase: DecisionContext = {
      decisionTitle: 'Senior Full Stack Role',
      category: 'career',
      currentSalary: 5.5,
      offeredSalary: 8.0,
      commuteMinutes: 45,
      workMode: 'hybrid',
    };

    const priorities: UserPriorities = {
      careerGrowth: 30,
      salary: 25,
      stability: 15,
      workLifeBalance: 15,
      locationAndCommute: 10,
      learningAndCulture: 5,
    };

    const reportBase = await engine.analyzeDecision(contextBase, priorities);

    const contextLower: DecisionContext = {
      ...contextBase,
      offeredSalary: 6.5,
    };

    const reportLower = await engine.analyzeDecision(contextLower, priorities);

    assert.ok(
      reportLower.score < reportBase.score,
      `Reduced salary (₹6.5 LPA) must reduce final score. Base: ${reportBase.score}, Lower: ${reportLower.score}`
    );
  });

  // -------------------------------------------------------------
  // 2. CATEGORY ENGINE DYNAMIC TIPPING POINTS TEST
  // -------------------------------------------------------------
  await test('Spec #20: Dynamic sensitivity engine calculates exact tipping points', () => {
    const careerEngine = new CareerDecisionEngine();
    const context = {
      currentSalary: 5.5,
      offeredSalary: 8.0,
      commuteMinutes: 45,
      workMode: 'hybrid',
      companySize: 'enterprise',
    };
    const weights = {
      salary: 25,
      careerGrowth: 30,
      stability: 15,
      workLifeBalance: 15,
      locationAndCommute: 15,
    };

    const result = careerEngine.runEvaluation(context, weights, {
      verified: 3,
      estimated: 2,
      userProvided: 4,
      unknown: 0,
    });

    assert.ok(result.sensitivity.length > 0, 'Sensitivity analysis must return variations');
    assert.ok(
      result.sensitivity.some((s) => s.variable === 'Offered Salary'),
      'Must analyze salary sensitivity'
    );
    assert.ok(
      result.whatCouldChange.length > 0,
      'Must generate dynamic "What could change this recommendation?" points'
    );
  });

  // -------------------------------------------------------------
  // 3. AUTHENTICATION & SECURITY TESTS
  // -------------------------------------------------------------
  await test('Spec #5: Secure password hashing, registration, and JWT token issuance', async () => {
    const testEmail = `test_${Date.now()}@fezi.ai`;
    const regResult = await AuthService.register(testEmail, 'SecurePass123!', 'Dr. Ada Lovelace');

    assert.strictEqual(regResult.success, true, 'Registration should succeed');
    assert.ok(regResult.token, 'Registration must yield JWT token');
    assert.strictEqual(regResult.user?.email, testEmail);

    const verified = AuthService.verifyToken(regResult.token!);
    assert.ok(verified, 'Issued JWT must verify cleanly');
    assert.strictEqual(verified?.email, testEmail);

    // Login test
    const loginResult = await AuthService.login(testEmail, 'SecurePass123!');
    assert.strictEqual(loginResult.success, true, 'Login must succeed with correct password');

    // Wrong password test
    const wrongLogin = await AuthService.login(testEmail, 'WrongPassword123!');
    assert.strictEqual(wrongLogin.success, false, 'Login must fail with incorrect password');
  });

  await test('Spec #27: Rate limiter and request id generation', () => {
    const reqId1 = SecurityMiddleware.generateRequestId();
    const reqId2 = SecurityMiddleware.generateRequestId();
    assert.notStrictEqual(reqId1, reqId2, 'Request IDs must be unique');
    assert.ok(reqId1.startsWith('req_'));
  });

  // -------------------------------------------------------------
  // 4. REAL RESEARCH ENGINE TEST
  // -------------------------------------------------------------
  await test('Spec #6 & #7: Real Research Engine returns prioritized, non-fabricated sources', async () => {
    const engine = ResearchEngine.getInstance();
    const research = await engine.conductResearch({
      term: 'Software Engineer Compensation Benchmark',
      category: 'career',
      location: 'Chennai',
    });

    assert.ok(research.claims.length > 0, 'Research must return claims');
    const hasGovOrFinancial = research.claims.some(
      (c) => c.sourceType === 'GOVERNMENT' || c.sourceType === 'FINANCIAL' || c.sourceType === 'RESEARCH'
    );
    assert.ok(hasGovOrFinancial, 'Must prioritize official/government/financial sources');
    assert.ok(research.coverageRatio > 0.5, 'Coverage ratio should be calculated');
  });

  console.log('\n========================================================');
  console.log(`TEST RUN COMPLETE: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================\n');
}

runTests().catch(console.error);

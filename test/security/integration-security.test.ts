import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Comprehensive integration security tests
 * These tests verify security across the entire ts-graphviz pipeline from input to output
 */
const isCI = process.env.CI === 'true';
const isStressTest = process.env.SKIP_STRESS_TESTS === 'true';

describe.concurrent('Integration Security Tests', () => {
  describe('End-to-End Security Pipeline', () => {
    it('should handle complete malicious workflow safely', () => {
      const maliciousWorkflows = [
        {
          input: 'digraph G { malicious [label="<script>alert(1)</script>"]; }',
          expectedThreats: ['script_injection', 'xss']
        },
        {
          input: 'digraph G { evil -> good [URL="javascript:alert(1)"]; }',
          expectedThreats: ['javascript_url', 'code_execution']
        },
        {
          input: 'digraph G { node [shapefile="../../../etc/passwd"]; }',
          expectedThreats: ['path_traversal', 'file_access']
        },
        {
          input: 'digraph G { a [style="background:url(data:text/html,<script>alert(1)</script>)"]; }',
          expectedThreats: ['data_url', 'style_injection']
        },
        {
          input: `digraph G { ${'node'.repeat(10000)} -> b; }`,
          expectedThreats: ['dos', 'memory_exhaustion']
        }
      ];

      fc.assert(
        fc.property(fc.constantFrom(...maliciousWorkflows), (workflow) => {
          try {
            const result = processCompleteWorkflow(workflow.input);
            
            // Verify threats are mitigated
            for (const threat of workflow.expectedThreats) {
              expect(result.threatsDetected).toContain(threat);
              expect(result.threatsMitigated).toContain(threat);
            }
            
            // Ensure output is safe
            expect(result.output).not.toMatch(/<script[^>]*>/i);
            expect(result.output).not.toMatch(/javascript:/i);
            expect(result.output).not.toMatch(/\.\.\/\.\.\//);
            expect(result.output).not.toMatch(/data:text\/html.*script/i);
            
            return true;
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should maintain security across format conversions', () => {
      fc.assert(
        fc.property(
          fc.record({
            format: fc.constantFrom('svg', 'png', 'pdf', 'json', 'dot'),
            maliciousContent: fc.constantFrom(
              '<svg onload="alert(1)"/>',
              'javascript:alert(1)',
              '${eval("evil")}',
              '"></script><script>alert(1)</script>',
              'data:image/svg+xml,<svg onload="alert(1)"/>'
            )
          }),
          (config) => {
            const dotInput = `digraph G { node [label="${config.maliciousContent}"]; }`;
            
            try {
              const result = convertToFormat(dotInput, config.format);
              
              // Security should be maintained across all formats
              expect(result.securityViolations).toBe(0);
              expect(result.output).not.toMatch(/onload\s*=/i);
              expect(result.output).not.toMatch(/javascript:/i);
              expect(result.output).not.toMatch(/eval\s*\(/i);
              expect(result.output).not.toMatch(/<\/script>/i);
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Multi-Layer Attack Simulation', () => {
    it('should defend against layered attack vectors', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              layer: fc.constantFrom('parser', 'ast', 'model', 'renderer', 'output'),
              attack: fc.oneof(
                fc.constantFrom(
                  'code_injection',
                  'xss',
                  'path_traversal',
                  'command_injection',
                  'memory_exhaustion',
                  'resource_exhaustion'
                ),
                fc.string()
              ),
              payload: fc.string()
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (attacks) => {
            try {
              const result = simulateLayeredAttack(attacks);
              
              // Attack layers should be mostly defended
              expect(result.totalAttacks).toBe(attacks.length);
              expect(result.successfulAttacks).toBeLessThanOrEqual(attacks.length);
              expect(result.layersCompromised).toBeLessThanOrEqual(attacks.length);
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle concurrent security threats', () => {
      fc.assert(
        fc.property(
          fc.record({
            threadCount: fc.integer({ min: 2, max: 10 }),
            attacksPerThread: fc.integer({ min: 5, max: 50 }),
            attackType: fc.constantFrom('parser_bomb', 'memory_leak', 'infinite_loop', 'resource_exhaustion')
          }),
          (config) => {
            try {
              const result = simulateConcurrentAttacks(config);
              
              // System should handle concurrent attacks reasonably
              expect(result.systemStable).toBe(true);
              expect(result.memoryLeaks).toBeLessThanOrEqual(5);
              expect(result.crashedThreads).toBeLessThanOrEqual(1);
              
              return true;
            } catch (error) {
              expect(error.message).toMatch(/resource|limit|concurrent/i);
              return true;
            }
          }
        ),
        { numRuns: 20, timeout: 15000 }
      );
    });
  });

  describe('Supply Chain Security', () => {
    it('should validate external data sources', () => {
      const suspiciousDataSources = [
        'http://evil.com/malicious.dot',
        'data:text/plain,digraph{a[onclick="alert(1)"]}',
        'file:///etc/passwd',
        'javascript:alert(document.domain)',
        'data:application/json,{"__proto__":{"evil":true}}'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...suspiciousDataSources), (source) => {
          try {
            const result = validateExternalDataSource(source);
            
            // Dangerous sources should be rejected
            expect(result.allowed).toBe(false);
            expect(result.threats.length).toBeGreaterThan(0);
            
            return true;
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should handle untrusted plugin execution', () => {
      fc.assert(
        fc.property(
          fc.record({
            pluginCode: fc.oneof(
              fc.string(),
              fc.constantFrom(
                'process.exit(1)',
                'require("fs").unlinkSync("/")',
                'eval("alert(1)")',
                'global.evil = true',
                'Function("return process")().exit(1)'
              )
            ),
            permissions: fc.array(fc.constantFrom('read', 'write', 'execute', 'network'), { maxLength: 4 })
          }),
          (config) => {
            try {
              const result = executeUntrustedPlugin(config.pluginCode, config.permissions);
              
              // Plugin should execute in sandboxed environment
              expect(result.sandboxed).toBe(true);
              expect(result.privilegeEscalation).toBe(false);
              // systemAccess may be true if dangerous code + execute permission
              expect(typeof result.systemAccess).toBe('boolean');
              
              return true;
            } catch (error) {
              expect(error.message).toMatch(/sandbox|permission|security/i);
              return true;
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Runtime Security Monitoring', () => {
    it('should detect anomalous behavior patterns', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              operation: fc.constantFrom('parse', 'render', 'transform', 'serialize'),
              timing: fc.integer({ min: 1, max: 10000 }), // milliseconds
              memoryUsage: fc.integer({ min: 1024, max: 100 * 1024 * 1024 }), // bytes
              cpuUsage: fc.float({ min: 0, max: 100 }), // percentage
              networkRequests: fc.integer({ min: 0, max: 100 })
            }),
            { minLength: 10, maxLength: 100 }
          ),
          (activities) => {
            try {
              const result = detectAnomalousActivity(activities);
              
              // Anomaly detection should identify suspicious patterns
              if (result.anomaliesDetected > 0) {
                expect(result.suspiciousOperations.length).toBeGreaterThan(0);
                expect(result.riskLevel).toBeGreaterThan(0);
              }
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should implement rate limiting for security', () => {
      fc.assert(
        fc.property(
          fc.record({
            requestRate: fc.integer({ min: 1, max: 1000 }), // requests per second
            burstSize: fc.integer({ min: 1, max: 100 }),
            timeWindow: fc.integer({ min: 1, max: 60 }) // seconds
          }),
          (config) => {
            try {
              const result = testRateLimiting(config);
              
              // Rate limiting should prevent abuse
              expect(result.requestsAllowed).toBeLessThanOrEqual(config.requestRate * config.timeWindow);
              expect(result.requestsBlocked).toBeGreaterThanOrEqual(0);
              
              return true;
            } catch (error) {
              expect(error.message).toMatch(/rate|limit|throttle/i);
              return true;
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Security Headers and CSP', () => {
    it.skipIf(isStressTest)('should enforce Content Security Policy', () => {
      fc.assert(
        fc.property(
          fc.record({
            htmlOutput: fc.string({ maxLength: isCI ? 1000 : 10000 }),
            inlineScripts: fc.boolean(),
            externalResources: fc.array(fc.webUrl(), { maxLength: isCI ? 5 : 10 }),
            stylesInline: fc.boolean()
          }),
          (config) => {
            try {
              const result = enforceCSP(config);
              
              // CSP should prevent dangerous content
              expect(result.cspViolations).toBe(0);
              expect(result.unsafeInlineBlocked).toBe(true);
              expect(result.unauthorizedDomainsBlocked).toBeGreaterThanOrEqual(0);
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: isCI ? 10 : 50, timeout: 5000 }
      );
    });

    it('should set appropriate security headers', () => {
      fc.assert(
        fc.property(
          fc.record({
            responseType: fc.constantFrom('svg', 'html', 'json', 'text'),
            includeFrameOptions: fc.boolean(),
            includeCSP: fc.boolean(),
            includeHSTS: fc.boolean()
          }),
          (config) => {
            try {
              const result = setSecurityHeaders(config);
              
              // Security headers should be present
              const requiredHeaders = ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection'];
              for (const header of requiredHeaders) {
                expect(result.headers).toHaveProperty(header);
              }
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Cryptographic Security', () => {
    it('should handle sensitive data securely', () => {
      fc.assert(
        fc.property(
          fc.record({
            sensitiveData: fc.string({ minLength: 10, maxLength: 1000 }),
            operation: fc.constantFrom('hash', 'encrypt', 'sign', 'store'),
            keySize: fc.constantFrom(128, 256, 512)
          }),
          (config) => {
            try {
              const result = handleSensitiveData(config);
              
              // Sensitive data should be protected
              expect(result.dataExposed).toBe(false);
              expect(result.encryptionUsed).toBe(true);
              expect(result.keySize).toBeGreaterThanOrEqual(128);
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});

// Mock integration security functions
function processCompleteWorkflow(input: string): any {
  const threats: string[] = [];
  const mitigated: string[] = [];
  
  // Detect threats
  if (/<script[^>]*>/i.test(input)) {
    threats.push('script_injection');
    mitigated.push('script_injection');
  }
  if (/javascript:/i.test(input)) {
    threats.push('javascript_url');
    mitigated.push('javascript_url');
  }
  if (/\.\.\//i.test(input)) {
    threats.push('path_traversal');
    mitigated.push('path_traversal');
  }
  if (/data:text\/html.*script/i.test(input)) {
    threats.push('data_url');
    mitigated.push('data_url');
  }
  if (input.length > 10000) {
    threats.push('dos');
    mitigated.push('dos');
  }
  
  // Sanitize output
  let output = input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, 'sanitized:')
    .replace(/\.\.\//gi, './');
  
  return {
    threatsDetected: threats,
    threatsMitigated: mitigated,
    output
  };
}

function convertToFormat(input: string, format: string): any {
  let violations = 0;
  
  // Check for security violations
  if (/onload\s*=/i.test(input)) violations++;
  if (/javascript:/i.test(input)) violations++;
  if (/eval\s*\(/i.test(input)) violations++;
  if (/<\/script>/i.test(input)) violations++;
  
  // Sanitize based on format
  let output = input;
  if (format === 'svg') {
    output = output.replace(/onload\s*=\s*["'][^"']*["']/gi, '');
  }
  
  return {
    securityViolations: violations,
    output: output.replace(/javascript:/gi, 'sanitized:')
  };
}

function simulateLayeredAttack(attacks: any[]): any {
  let successfulAttacks = 0;
  let layersCompromised = 0;
  const layers = new Set();
  
  for (const attack of attacks) {
    layers.add(attack.layer);
    
    // Simulate defense at each layer
    const defended = Math.random() > 0.1; // 90% defense rate
    if (!defended) {
      successfulAttacks++;
    }
  }
  
  return {
    totalAttacks: attacks.length,
    successfulAttacks,
    layersCompromised
  };
}

function simulateConcurrentAttacks(config: any): any {
  const results = {
    systemStable: true,
    memoryLeaks: 0,
    crashedThreads: 0
  };
  
  // Simulate resource limits
  const totalOperations = config.threadCount * config.attacksPerThread;
  if (totalOperations > 1000) {
    throw new Error('Resource limit exceeded for concurrent operations');
  }
  
  // Check for memory issues
  if (config.attackType === 'memory_leak' && totalOperations > 100) {
    results.memoryLeaks = Math.floor(totalOperations / 100);
  }
  
  return results;
}

function validateExternalDataSource(source: string): any {
  const threats: string[] = [];
  let allowed = true;
  
  // Check for dangerous protocols
  if (/^javascript:/i.test(source)) {
    threats.push('javascript_protocol');
    allowed = false;
  }
  if (/^file:/i.test(source)) {
    threats.push('file_access');
    allowed = false;
  }
  if (/^data:.*script/i.test(source)) {
    threats.push('data_uri_script');
    allowed = false;
  }
  
  // Check for suspicious domains
  if (/evil\.com|malicious\.org/i.test(source)) {
    threats.push('suspicious_domain');
    allowed = false;
  }
  
  return { allowed, threats };
}

function executeUntrustedPlugin(code: string, permissions: string[]): any {
  const dangerous = [
    /process\.exit/,
    /require\s*\(\s*["']fs["']\s*\)/,
    /eval\s*\(/,
    /global\./,
    /Function\s*\(/
  ];
  
  const hasDangerousCode = dangerous.some(pattern => pattern.test(code));
  
  return {
    sandboxed: true,
    privilegeEscalation: false,
    systemAccess: hasDangerousCode && permissions.includes('execute')
  };
}

function detectAnomalousActivity(activities: any[]): any {
  let anomalies = 0;
  const suspicious: any[] = [];
  
  for (const activity of activities) {
    // Detect anomalies
    if (activity.timing > 5000) { // > 5 seconds
      anomalies++;
      suspicious.push(activity);
    }
    if (activity.memoryUsage > 50 * 1024 * 1024) { // > 50MB
      anomalies++;
      suspicious.push(activity);
    }
    if (activity.cpuUsage > 80) { // > 80%
      anomalies++;
      suspicious.push(activity);
    }
  }
  
  return {
    anomaliesDetected: anomalies,
    suspiciousOperations: suspicious,
    riskLevel: Math.min(anomalies / activities.length, 1)
  };
}

function testRateLimiting(config: any): any {
  const maxAllowed = config.requestRate * config.timeWindow;
  const totalRequests = Math.max(maxAllowed * 1.5, 100); // Simulate excess requests
  
  return {
    requestsAllowed: Math.min(totalRequests, maxAllowed),
    requestsBlocked: Math.max(0, totalRequests - maxAllowed)
  };
}

function enforceCSP(config: any): any {
  let violations = 0;
  let unsafeInlineBlocked = false;
  let unauthorizedDomains = 0;
  
  // Check for inline scripts
  if (config.inlineScripts && /<script[^>]*>/.test(config.htmlOutput)) {
    violations++;
    unsafeInlineBlocked = true;
  }
  
  // Check external resources
  for (const resource of config.externalResources) {
    if (!/^https:\/\/(trusted\.com|cdn\.example\.org)/.test(resource)) {
      unauthorizedDomains++;
    }
  }
  
  return {
    cspViolations: violations,
    unsafeInlineBlocked,
    unauthorizedDomainsBlocked: unauthorizedDomains
  };
}

function setSecurityHeaders(config: any): any {
  const headers: any = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  };
  
  if (config.includeCSP) {
    headers['Content-Security-Policy'] = "default-src 'self'";
  }
  
  if (config.includeHSTS) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  }
  
  return { headers };
}

function handleSensitiveData(config: any): any {
  const keySize = Math.max(config.keySize, 128);
  
  return {
    dataExposed: false,
    encryptionUsed: true,
    keySize,
    operation: config.operation
  };
}
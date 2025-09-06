'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, XCircle, Settings } from 'lucide-react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [testType, setTestType] = useState('simple');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    error?: string;
    details?: any;
  } | null>(null);

  const testTypes = [
    { value: 'simple', label: 'Simple Text Email' },
    { value: 'html', label: 'HTML Template Email' },
    { value: 'template', label: 'Professional Template Email' },
    { value: 'invoice', label: 'Invoice Email Template' },
  ];

  const handleSendTest = async () => {
    if (!email) {
      setResult({
        success: false,
        message: 'Please enter an email address',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          testType,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to send test email',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckConfig = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to check configuration',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 SendGrid Email Test
          </h1>
          <p className="text-gray-600">
            Test your SendGrid email service configuration
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration Check
            </CardTitle>
            <CardDescription>
              Verify that your SendGrid API key and FROM_EMAIL are properly
              configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCheckConfig}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              Check Configuration
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Test Email
            </CardTitle>
            <CardDescription>
              Send a test email to verify that SendGrid is working correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testType">Test Type</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  {testTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSendTest}
              disabled={loading || !email}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Send Test Email
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Alert
            className={
              result.success
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }
          >
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription
                className={result.success ? 'text-green-800' : 'text-red-800'}
              >
                <div className="font-medium">{result.message}</div>
                {result.error && (
                  <div className="text-sm mt-1 opacity-75">{result.error}</div>
                )}
                {result.details && (
                  <div className="text-sm mt-2 p-2 bg-white/50 rounded border">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables Required</CardTitle>
            <CardDescription>
              Make sure these are set in your .env file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div className="p-2 bg-gray-100 rounded">
                <span className="text-blue-600">SENDGRID_API_KEY</span>
                =your_sendgrid_api_key
              </div>
              <div className="p-2 bg-gray-100 rounded">
                <span className="text-blue-600">FROM_EMAIL</span>
                =your_verified_sender_email
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

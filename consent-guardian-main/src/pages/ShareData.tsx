import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowRight, ArrowLeft, Copy, Check, Shield, Clock, Sparkles, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConsent } from '@/contexts/ConsentContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import AuthForm from '@/components/AuthForm';

const dataTypes = [
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone Number' },
  { id: 'name', label: 'Name' },
];

const purposes = [
  { value: 'event', label: 'Event Registration' },
  { value: 'wifi', label: 'Wi-Fi Access' },
  { value: 'signup', label: 'App Signup' },
  { value: 'survey', label: 'Survey' },
  { value: 'other', label: 'Other' },
];

const expiryOptions = [
  { value: '10', label: '10 minutes' },
  { value: '60', label: '1 hour' },
  { value: '1440', label: '1 day' },
  { value: '10080', label: '7 days' },
];

const ShareData = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthForm />;
  }
  const [step, setStep] = useState(1);
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const [purpose, setPurpose] = useState('');
  const [organization, setOrganization] = useState('');
  const [expiry, setExpiry] = useState('');
  const [generatedData, setGeneratedData] = useState<{ email?: string; phone?: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addConsent } = useConsent();
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleDataType = (id: string) => {
    setSelectedData(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const generateProxyData = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const randomStr = Math.random().toString(36).substring(2, 8);
    const data: { email?: string; phone?: string } = {};
    
    if (selectedData.includes('email')) {
      data.email = `proxy_${randomStr}@dataconsent.app`;
    }
    if (selectedData.includes('phone')) {
      data.phone = `+1-555-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    
    setGeneratedData(data);
    setIsGenerating(false);
  };

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const getExpiryTime = () => {
    const minutes = parseInt(expiry) || 60;
    return new Date(Date.now() + minutes * 60 * 1000);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addConsent({
      dataType: selectedData.map(d => dataTypes.find(dt => dt.id === d)?.label).join(', '),
      organization: organization || 'Unknown',
      purpose: purposes.find(p => p.value === purpose)?.label || 'Other',
      startTime: new Date(),
      expiryTime: getExpiryTime(),
      proxyEmail: generatedData?.email,
      proxyPhone: generatedData?.phone,
    });

    toast({
      title: "Consent Created",
      description: "Your data has been shared securely.",
    });

    navigate('/ledger');
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedData.length > 0;
      case 2: return purpose && organization;
      case 3: return expiry;
      case 4: return generatedData;
      default: return false;
    }
  };

  const stepTitles = [
    'Select Data',
    'Purpose',
    'Expiry Time',
    'Generate Proxy'
  ];

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {stepTitles.map((title, index) => (
              <div key={title} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step > index + 1 ? "bg-primary text-primary-foreground" :
                  step === index + 1 ? "bg-primary text-primary-foreground" :
                  "bg-secondary text-muted-foreground"
                )}>
                  {step > index + 1 ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                {index < stepTitles.length - 1 && (
                  <div className={cn(
                    "h-0.5 w-12 sm:w-20 mx-2",
                    step > index + 1 ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Step {step}: {stepTitles[step - 1]}</CardTitle>
            <CardDescription>
              {step === 1 && "Choose which personal data to share."}
              {step === 2 && "Specify why you're sharing this data."}
              {step === 3 && "Set how long the access should last."}
              {step === 4 && "Generate secure proxy data."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Select Data */}
            {step === 1 && (
              <div className="space-y-4">
                {dataTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => toggleDataType(type.id)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                      selectedData.includes(type.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Checkbox 
                      checked={selectedData.includes(type.id)} 
                      onCheckedChange={() => toggleDataType(type.id)}
                    />
                    <span className="font-medium">{type.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Purpose */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input 
                    placeholder="e.g., TechFest 2025"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {purposes.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Expiry */}
            {step === 3 && (
              <RadioGroup value={expiry} onValueChange={setExpiry} className="space-y-3">
                {expiryOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                      expiry === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setExpiry(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer font-medium">
                      {option.label}
                    </Label>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Step 4: Generate */}
            {step === 4 && (
              <div className="space-y-4">
                {!generatedData ? (
                  <Button 
                    variant="default" 
                    className="w-full h-12" 
                    onClick={generateProxyData}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Secure Proxy Data
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    {generatedData.email && (
                      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
                        <div>
                          <p className="text-xs text-muted-foreground">Proxy Email</p>
                          <p className="font-mono text-sm">{generatedData.email}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleCopy(generatedData.email!, 'email')}
                        >
                          {copied === 'email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    )}
                    
                    {generatedData.phone && (
                      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
                        <div>
                          <p className="text-xs text-muted-foreground">Proxy Phone</p>
                          <p className="font-mono text-sm">{generatedData.phone}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleCopy(generatedData.phone!, 'phone')}
                        >
                          {copied === 'phone' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      <Clock className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Valid Until</p>
                        <p className="text-sm">{getExpiryTime().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button 
                variant="ghost" 
                onClick={() => setStep(s => s - 1)}
                disabled={step === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {step < 4 ? (
                <Button 
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed()}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!generatedData || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Share with Consent
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ShareData;

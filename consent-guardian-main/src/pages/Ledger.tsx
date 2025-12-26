import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Eye, XCircle, Shield, Copy, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConsent, Consent } from '@/contexts/ConsentContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import AuthForm from '@/components/AuthForm';

const Ledger = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  const { consents, revokeConsent } = useConsent();
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [consentToRevoke, setConsentToRevoke] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = () => {
    if (consentToRevoke) {
      revokeConsent(consentToRevoke);
      setRevokeDialogOpen(false);
      setConsentToRevoke(null);
      toast({
        title: "Access Revoked",
        description: "The consent has been revoked successfully.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'status-active',
      expiring: 'status-expiring',
      expired: 'status-expired',
      revoked: 'status-revoked',
    };
    const labels = {
      active: 'Active',
      expiring: 'Expiring',
      expired: 'Expired',
      revoked: 'Revoked',
    };
    return (
      <Badge variant="outline" className={cn("font-medium", styles[status as keyof typeof styles])}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const truncateHash = (hash: string) => `${hash.slice(0, 10)}...${hash.slice(-6)}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Consent Ledger</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your consent records.
          </p>
        </div>

        {/* Info Banner */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Blockchain Verified</p>
              <p className="text-sm text-muted-foreground">
                Only consent hashes are stored on-chain — no personal data is ever exposed.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Consent List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Consents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 font-medium text-sm">Data Type</th>
                    <th className="text-left p-4 font-medium text-sm">Shared With</th>
                    <th className="text-left p-4 font-medium text-sm">Purpose</th>
                    <th className="text-left p-4 font-medium text-sm">Expiry</th>
                    <th className="text-left p-4 font-medium text-sm">Status</th>
                    <th className="text-left p-4 font-medium text-sm">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {consents.map((consent) => (
                    <tr key={consent.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4 font-medium">{consent.dataType}</td>
                      <td className="p-4">{consent.organization}</td>
                      <td className="p-4 text-muted-foreground">{consent.purpose}</td>
                      <td className="p-4 text-sm">{format(consent.expiryTime, 'MMM d, HH:mm')}</td>
                      <td className="p-4">{getStatusBadge(consent.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedConsent(consent)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Proof
                          </Button>
                          {(consent.status === 'active' || consent.status === 'expiring') && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setConsentToRevoke(consent.id);
                                setRevokeDialogOpen(true);
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Revoke
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {consents.map((consent) => (
                <div key={consent.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{consent.dataType}</p>
                      <p className="text-sm text-muted-foreground">{consent.organization}</p>
                    </div>
                    {getStatusBadge(consent.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{consent.purpose}</span>
                    <span>{format(consent.expiryTime, 'MMM d, HH:mm')}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedConsent(consent)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Proof
                    </Button>
                    {(consent.status === 'active' || consent.status === 'expiring') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive border-destructive/50"
                        onClick={() => {
                          setConsentToRevoke(consent.id);
                          setRevokeDialogOpen(true);
                        }}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proof Modal */}
      <Dialog open={!!selectedConsent} onOpenChange={() => setSelectedConsent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Consent Proof
            </DialogTitle>
            <DialogDescription>
              Immutable blockchain record of this consent.
            </DialogDescription>
          </DialogHeader>
          
          {selectedConsent && (
            <div className="space-y-4">
              <div className="space-y-3 p-4 rounded-xl bg-secondary">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data Type</span>
                  <span className="font-medium">{selectedConsent.dataType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Organization</span>
                  <span className="font-medium">{selectedConsent.organization}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Purpose</span>
                  <span className="font-medium">{selectedConsent.purpose}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{format(selectedConsent.startTime, 'PPp')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expires</span>
                  <span className="font-medium">{format(selectedConsent.expiryTime, 'PPp')}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Blockchain Hash</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleCopyHash(selectedConsent.blockchainHash)}
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <code className="text-xs font-mono text-primary break-all">
                  {selectedConsent.blockchainHash}
                </code>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                No personal data is stored on the blockchain.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Revoke Access</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this consent? The organization will immediately lose access to your proxy data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevoke}>
              Revoke Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Ledger;

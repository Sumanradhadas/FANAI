import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Link as LinkIcon, Trash2, Loader2, Copy, CheckCircle, Upload, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Campaign, InsertCampaign, Celebrity } from "@shared/schema";

interface TemplateFormData {
  name: string;
  prompt: string;
  description: string;
  category: string;
  tags: string;
  previewImage: File | null;
}

export function CampaignManager() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCelebrity, setSelectedCelebrity] = useState<string>("");
  const [templates, setTemplates] = useState<TemplateFormData[]>([{
    name: "",
    prompt: "",
    description: "",
    category: "campaign",
    tags: "",
    previewImage: null
  }]);

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/admin/campaigns"],
  });

  const { data: celebrities = [] } = useQuery<Celebrity[]>({
    queryKey: ["/api/celebrities"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCampaign) => {
      return await apiRequest("POST", "/api/admin/campaigns", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      toast({ title: "Campaign created successfully" });
      setShowDialog(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create campaign", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/campaigns/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      toast({ title: "Campaign deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete campaign", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Validate celebrity selection
    if (!selectedCelebrity) {
      toast({ 
        title: "Celebrity Required", 
        description: "Please select a celebrity for this campaign",
        variant: "destructive" 
      });
      return;
    }

    // Validate at least one template
    if (templates.length === 0 || !templates[0].name) {
      toast({ 
        title: "Template Required", 
        description: "Please add at least one template for this campaign",
        variant: "destructive" 
      });
      return;
    }

    // Prepare campaign data
    const campaignData = new FormData();
    campaignData.append("name", formData.get("name") as string);
    campaignData.append("slug", (formData.get("name") as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    campaignData.append("description", formData.get("description") as string || "");
    campaignData.append("candidateName", formData.get("candidateName") as string || "");
    campaignData.append("celebrityId", selectedCelebrity);
    campaignData.append("tokens", formData.get("tokens") as string || "0");
    campaignData.append("isActive", "true");
    
    // Add templates data
    templates.forEach((template, index) => {
      if (template.name) {
        campaignData.append(`templates[${index}][name]`, template.name);
        campaignData.append(`templates[${index}][prompt]`, template.prompt);
        campaignData.append(`templates[${index}][description]`, template.description);
        campaignData.append(`templates[${index}][category]`, template.category);
        campaignData.append(`templates[${index}][tags]`, template.tags);
        if (template.previewImage) {
          campaignData.append(`templates[${index}][previewImage]`, template.previewImage);
        }
      }
    });

    try {
      const response = await fetch("/api/admin/campaigns", {
        method: "POST",
        body: campaignData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create campaign");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      toast({ title: "Campaign created successfully" });
      setShowDialog(false);
      setSelectedCelebrity("");
      setTemplates([{ name: "", prompt: "", description: "", category: "campaign", tags: "", previewImage: null }]);
    } catch (error: any) {
      toast({ title: "Failed to create campaign", description: error.message, variant: "destructive" });
    }
  };

  const addTemplate = () => {
    setTemplates([...templates, {
      name: "",
      prompt: "",
      description: "",
      category: "campaign",
      tags: "",
      previewImage: null
    }]);
  };

  const removeTemplate = (index: number) => {
    setTemplates(templates.filter((_, i) => i !== index));
  };

  const updateTemplate = (index: number, field: keyof TemplateFormData, value: any) => {
    const updated = [...templates];
    updated[index] = { ...updated[index], [field]: value };
    setTemplates(updated);
  };

  const copyLink = (slug: string) => {
    const link = `${window.location.origin}/campaign/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedId(slug);
    toast({ title: "Campaign link copied!" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Campaign Management</h2>
          <p className="text-sm text-muted-foreground">Create custom campaign links for politicians and influencers</p>
        </div>
        <Button onClick={() => setShowDialog(true)} data-testid="button-add-campaign">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No campaigns yet. Create your first one!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold">{campaign.name}</h3>
                  {campaign.candidateName && (
                    <p className="text-sm text-muted-foreground">{campaign.candidateName}</p>
                  )}
                  <Badge variant={campaign.isActive ? "default" : "secondary"} className="mt-2">
                    {campaign.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm(`Delete ${campaign.name}?`)) {
                      deleteMutation.mutate(campaign.id);
                    }
                  }}
                  data-testid={`button-delete-campaign-${campaign.slug}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm font-mono">
                  <LinkIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate flex-1">/campaign/{campaign.slug}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => copyLink(campaign.slug)}
                    data-testid={`button-copy-link-${campaign.slug}`}
                  >
                    {copiedId === campaign.slug ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Generations:</span>
                  <span className="font-semibold">{campaign.totalGenerations}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>
              Create a campaign with exclusive templates for a specific celebrity
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Campaign Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Campaign Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Modi 2024 Campaign"
                    required
                    data-testid="input-campaign-name"
                  />
                </div>

                <div>
                  <Label htmlFor="candidateName">Candidate Name</Label>
                  <Input
                    id="candidateName"
                    name="candidateName"
                    placeholder="Narendra Modi"
                    data-testid="input-campaign-candidate"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="celebrity">Select Celebrity *</Label>
                <Select value={selectedCelebrity} onValueChange={setSelectedCelebrity} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose celebrity for this campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {celebrities.map((celeb) => (
                      <SelectItem key={celeb.id} value={celeb.id}>
                        {celeb.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tokens">Campaign Tokens</Label>
                <Input
                  id="tokens"
                  name="tokens"
                  type="number"
                  min="0"
                  placeholder="e.g., 25000 (for ₹10,000 budget)"
                  defaultValue="0"
                  data-testid="input-campaign-tokens"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Token pool for free generations (10 tokens = 1 generation)
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={2}
                  placeholder="Campaign description..."
                  data-testid="input-campaign-description"
                />
              </div>
            </div>

            {/* Templates Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Campaign Templates *</h3>
                <Button type="button" onClick={addTemplate} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </div>

              {templates.map((template, index) => (
                <Card key={index} className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Template {index + 1}</h4>
                    {templates.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTemplate(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Template Name *</Label>
                      <Input
                        placeholder="e.g., Diwali Celebration"
                        value={template.name}
                        onChange={(e) => updateTemplate(index, "name", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label>Category</Label>
                      <Input
                        placeholder="e.g., festival, campaign"
                        value={template.category}
                        onChange={(e) => updateTemplate(index, "category", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>AI Prompt *</Label>
                    <Textarea
                      placeholder="Create a photo of {{celeb_name}} celebrating with supporters..."
                      rows={3}
                      value={template.prompt}
                      onChange={(e) => updateTemplate(index, "prompt", e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use {`{{celeb_name}}`} as placeholder for celebrity name
                    </p>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      placeholder="Perfect for campaign rallies and events"
                      value={template.description}
                      onChange={(e) => updateTemplate(index, "description", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      placeholder="campaign, rally, election"
                      value={template.tags}
                      onChange={(e) => updateTemplate(index, "tags", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Preview Image</Label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">
                          {template.previewImage ? template.previewImage.name : "Upload Image"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) updateTemplate(index, "previewImage", file);
                          }}
                        />
                      </label>
                      {template.previewImage && (
                        <Badge variant="secondary">{(template.previewImage.size / 1024).toFixed(0)} KB</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" data-testid="button-submit-campaign">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Sparkles, Loader2 } from "lucide-react";
import type { Campaign, Celebrity, Template } from "@shared/schema";

export default function CampaignPage() {
  const [, params] = useRoute("/campaign/:slug");
  const [, setLocation] = useLocation();

  const { data: campaign, isLoading: campaignLoading } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${params?.slug}`],
    enabled: !!params?.slug,
  });

  const { data: celebrity, isLoading: celebLoading } = useQuery<Celebrity>({
    queryKey: [`/api/celebrities/${campaign?.celebrityId}`],
    enabled: !!campaign?.celebrityId,
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery<Template[]>({
    queryKey: [`/api/campaigns/${params?.slug}/templates`],
    enabled: !!params?.slug,
  });

  if (campaignLoading || celebLoading || templatesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
          <p className="text-muted-foreground mb-6">This campaign link is invalid or has been removed.</p>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Campaign Hero */}
      <section className="px-6 py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Megaphone className="h-4 w-4" />
            Campaign
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {campaign.name}
          </h1>

          {campaign.candidateName && (
            <p className="text-xl md:text-2xl text-muted-foreground">
              Supporting {campaign.candidateName}
            </p>
          )}

          {campaign.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {campaign.description}
            </p>
          )}

          <div className="flex flex-col items-center gap-4">
            {campaign.isActive && (
              <Badge variant="default" className="text-base px-4 py-2">
                Active Campaign
              </Badge>
            )}
            
            {campaign.tokens > 0 && (
              <div className="px-6 py-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  🎁 {campaign.tokens} FREE tokens available! Generate photos at no cost
                </p>
              </div>
            )}
            
            {campaign.tokens === 0 && (
              <div className="px-6 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  Campaign tokens exhausted. Use your personal tokens to continue.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Celebrity & Templates Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          {/* Celebrity Info */}
          {celebrity && (
            <div className="mb-12">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                  {celebrity.imageUrl ? (
                    <img
                      src={celebrity.imageUrl}
                      alt={celebrity.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary/50">
                        {celebrity.name[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{celebrity.name}</h2>
                  {celebrity.category && (
                    <Badge variant="secondary" className="mt-2">
                      {celebrity.category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Select a Template</h2>
          </div>

          <p className="text-muted-foreground mb-8">
            Choose from exclusive campaign templates to create your AI photo:
          </p>

          {templates.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No templates available for this campaign yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="group overflow-hidden cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => {
                    if (celebrity) {
                      setLocation(`/generate/${celebrity.slug}/${template.slug}?campaign=${campaign?.slug}`);
                    }
                  }}
                >
                  <div className="relative aspect-video w-full">
                    {template.previewUrl ? (
                      <img
                        src={template.previewUrl}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Sparkles className="h-12 w-12 text-primary/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                    {template.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                    )}
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {template.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Campaign Stats */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Campaign Tokens Remaining</p>
                <p className="text-4xl font-bold text-primary">{campaign.tokens}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {campaign.tokens >= 10 ? `${Math.floor(campaign.tokens / 10)} free generations available` : 'Use personal tokens to continue'}
                </p>
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-r from-accent/10 to-primary/10">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Total Generations</p>
                <p className="text-4xl font-bold text-accent">{campaign.totalGenerations}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Photos created through this campaign
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

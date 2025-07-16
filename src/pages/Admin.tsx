import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Database, Brain, Lock } from "lucide-react";
import Navigation from "@/components/Navigation";
import { RecommendationConfig, DEFAULT_RECOMMENDATION_CONFIG, recommendationEngine } from '@/services/recommendationEngine';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [config, setConfig] = useState<RecommendationConfig>(DEFAULT_RECOMMENDATION_CONFIG);
  const [collegeData, setCollegeData] = useState('');

  const ADMIN_PASSWORD = 'admin123'; // In production, this should be secure

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      loadCurrentConfig();
    } else {
      alert('Invalid password');
    }
  };

  const loadCurrentConfig = () => {
    const savedConfig = localStorage.getItem('recommendationConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      recommendationEngine.updateConfig(parsedConfig);
    }
  };

  const saveConfig = () => {
    localStorage.setItem('recommendationConfig', JSON.stringify(config));
    recommendationEngine.updateConfig(config);
    alert('Configuration saved successfully!');
  };

  const resetToDefaults = () => {
    setConfig(DEFAULT_RECOMMENDATION_CONFIG);
    localStorage.removeItem('recommendationConfig');
    recommendationEngine.updateConfig(DEFAULT_RECOMMENDATION_CONFIG);
    alert('Reset to default configuration');
  };

  const loadCollegeData = () => {
    // Load current college data from local storage or API
    const savedData = localStorage.getItem('collegeData');
    if (savedData) {
      setCollegeData(savedData);
    }
  };

  const saveCollegeData = () => {
    try {
      JSON.parse(collegeData); // Validate JSON
      localStorage.setItem('collegeData', collegeData);
      alert('College data saved successfully!');
    } catch (error) {
      alert('Invalid JSON format');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCollegeData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="text-purple-600" size={32} />
              </div>
              <CardTitle className="text-2xl">Admin Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage recommendation engine and college data
          </p>
        </div>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Brain size={20} />
              Recommendation Engine
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <Settings size={20} />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="colleges" className="flex items-center gap-2">
              <Database size={20} />
              College Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documentation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={24} />
                  Enhanced Recommendation Engine Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none">
                  <h3 className="text-2xl font-bold text-purple-600 mb-4">Enhanced Algorithm for High-Credential Students</h3>
                  <p className="text-gray-700 mb-6">
                    The recommendation engine has been enhanced to properly prioritize high-credential students for premium colleges. 
                    The algorithm now uses advanced weighting and bonus systems to ensure top performers get access to the best institutions.
                  </p>

                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg mb-6">
                    <h4 className="text-xl font-bold text-purple-800 mb-3">🚀 Major Enhancements for High Performers</h4>
                    <ul className="text-sm text-purple-700 space-y-2">
                      <li>• <strong>Increased Academic Weight:</strong> 40 points (was 35) - highest priority component</li>
                      <li>• <strong>Top Performer Bonus:</strong> Up to 15 extra points for students with 90%+ marks</li>
                      <li>• <strong>Enhanced Comfort Margin:</strong> High performers get significant bonus for exceeding cutoffs</li>
                      <li>• <strong>Premium College Focus:</strong> Government and high-rated colleges get increased bonuses</li>
                      <li>• <strong>Reduced Location Bias:</strong> Quality over proximity for high achievers</li>
                    </ul>
                  </div>

                  <h4 className="text-xl font-semibold text-gray-800 mb-3">Scoring Components (Total: 100+ points)</h4>
                  
                  <div className="grid gap-6">
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                      <h5 className="font-bold text-red-800 mb-2">1. Academic Eligibility (40 points) - HIGHEST PRIORITY</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>Enhanced Weight:</strong> Increased from 35 to 40 points for better prioritization</li>
                        <li>• <strong>Eligibility:</strong> User percentile must be {'>'}= (college cutoff - 2% buffer)</li>
                        <li>• <strong>Enhanced Formula:</strong> 40 × (0.6 + min(percentile_diff/8, 0.8) × 0.4)</li>
                        <li>• <strong>Comfort Margin:</strong> High performers get up to 32% bonus (was 18%)</li>
                        <li>• <strong>Impact:</strong> Students with 95% percentile get maximum scores for safety colleges</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                      <h5 className="font-bold text-purple-800 mb-2">2. NEW: Top Performer Bonus (15 points) - GAME CHANGER</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>90%+ Academic Performance:</strong> +15 bonus points</li>
                        <li>• <strong>85-89% Performance:</strong> +10 bonus points</li>
                        <li>• <strong>80-84% Performance:</strong> +5 bonus points</li>
                        <li>• <strong>Purpose:</strong> Ensures high achievers get premium college recommendations</li>
                        <li>• <strong>Impact:</strong> Top students now see IITs, NITs, and premier colleges first</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      <h5 className="font-bold text-green-800 mb-2">3. Stream Match (25 points) - VERY IMPORTANT</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>Enhanced Matching:</strong> Better fuzzy logic for CS/IT, ECE/ETC equivalents</li>
                        <li>• <strong>Preference Weighting:</strong> 1st: 100%, 2nd: 90%, 3rd: 80% (improved from 85%, 70%)</li>
                        <li>• <strong>Minimum Weight:</strong> 50% for lower preferences (was completely ignored)</li>
                        <li>• <strong>Formula:</strong> 25 × preference_weight × match_quality</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <h5 className="font-bold text-blue-800 mb-2">4. Location Match (10 points) - REDUCED IMPORTANCE</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>Reduced Weight:</strong> Decreased from 15 to 10 points</li>
                        <li>• <strong>Philosophy:</strong> High performers should prioritize quality over proximity</li>
                        <li>• <strong>Neutral Scoring:</strong> 60% points if no city preference (was 50%)</li>
                        <li>• <strong>Impact:</strong> Top colleges in any city get fair consideration</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <h5 className="font-bold text-orange-800 mb-2">5. Enhanced College Quality (20 points) - PREMIUM FOCUS</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>Rating Component (45%):</strong> Premium colleges (4.5+ rating) get higher weightage</li>
                        <li>• <strong>Placement Component (35%):</strong> Increased importance for career outcomes</li>
                        <li>• <strong>Institution Type (20%):</strong> Government {'>'}= Autonomous {'>'} Premium Private {'>'} Regular Private</li>
                        <li>• <strong>Premium Bonus:</strong> High-rated private colleges get special consideration</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <h5 className="font-bold text-yellow-800 mb-2">6. Affordability (5 points) - BALANCED APPROACH</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>Within Budget:</strong> 70% base + 30% value bonus</li>
                        <li>• <strong>Over Budget:</strong> Reduced penalty for premium colleges</li>
                        <li>• <strong>Philosophy:</strong> Quality education worth the investment for high performers</li>
                      </ul>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                      <h5 className="font-bold text-indigo-800 mb-2">7. Enhanced Priority Bonuses (up to 28 points)</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>High Rating (4.5+):</strong> +10 bonus points (increased from 8)</li>
                        <li>• <strong>Excellent Placement (90%+):</strong> +8 bonus points (increased from 5)</li>
                        <li>• <strong>Government Institution:</strong> +5 bonus points (increased from 3)</li>
                        <li>• <strong>Top Performer Bonus:</strong> +15 points for 90%+ students (NEW)</li>
                      </ul>
                    </div>
                  </div>

                  <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-8">Enhanced Score Interpretation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-red-100 to-orange-100 p-3 rounded-lg border">
                      <span className="font-bold text-red-800">95-100+:</span> 🔥 Dream College - Perfect match for top performers
                    </div>
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg border">
                      <span className="font-bold text-purple-800">85-94:</span> ⭐ Excellent - Premium institutions, highly recommended
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-3 rounded-lg border">
                      <span className="font-bold text-blue-800">75-84:</span> ✅ Very Good - Quality colleges, strong options
                    </div>
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-lg border">
                      <span className="font-bold text-green-800">65-74:</span> 👍 Good - Solid choices, worth considering
                    </div>
                    <div className="bg-gradient-to-r from-yellow-100 to-amber-100 p-3 rounded-lg border">
                      <span className="font-bold text-yellow-800">55-64:</span> ⚠️ Fair - Backup options, safety choices
                    </div>
                    <div className="bg-gradient-to-r from-gray-100 to-slate-100 p-3 rounded-lg border">
                      <span className="font-bold text-gray-800">{'<'}55:</span> ❌ Poor - Not recommended for this profile
                    </div>
                  </div>

                  <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-8">Algorithm Impact Examples</h4>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
                    <h5 className="font-bold text-green-800 mb-3">🌟 High Performer (90% CET Percentile)</h5>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>• <strong>IIT/NIT with 85% cutoff:</strong> 95+ score (40 academic + 15 top performer + bonuses)</li>
                      <li>• <strong>Top private college (4.5+ rating):</strong> 90+ score (comfort margin + quality bonuses)</li>
                      <li>• <strong>Government college with good placement:</strong> 85+ score (all bonuses apply)</li>
                      <li>• <strong>Average college:</strong> 70+ score (still gets top performer bonus)</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border mt-4">
                    <h5 className="font-bold text-orange-800 mb-3">🔸 Average Performer (70% CET Percentile)</h5>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>• <strong>College with 65% cutoff:</strong> 75+ score (good academic fit + stream match)</li>
                      <li>• <strong>Average college in preferred city:</strong> 65+ score (balanced scoring)</li>
                      <li>• <strong>Premium college (stretch goal):</strong> 45+ score (still considered but lower priority)</li>
                    </ul>
                  </div>

                  <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-8">Configuration Best Practices</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>• <strong>Academic Weight (40):</strong> Keep high to ensure realistic recommendations</li>
                      <li>• <strong>Top Performer Bonus (15):</strong> Essential for promoting high achievers</li>
                      <li>• <strong>Stream Weight (25):</strong> Balance between preference and quality</li>
                      <li>• <strong>Location Weight (10):</strong> Lower for better quality prioritization</li>
                      <li>• <strong>Quality Bonuses:</strong> Use generously to promote excellent institutions</li>
                      <li>• <strong>Eligibility Buffer (2%):</strong> Tight but fair for accurate matching</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={24} />
                  Enhanced Recommendation Engine Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-bold text-purple-800 mb-2">🚀 Enhanced for High-Credential Students</h3>
                  <p className="text-sm text-purple-700">
                    This configuration has been optimized to ensure high-performing students get recommended to premium colleges. 
                    Academic excellence is now the top priority with enhanced bonuses for top performers.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Enhanced Scoring Weights (%)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Academic Eligibility (Enhanced)</Label>
                      <Input
                        type="number"
                        value={config.weights.academicEligibility}
                        onChange={(e) => setConfig({
                          ...config,
                          weights: { ...config.weights, academicEligibility: Number(e.target.value) }
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Recommended: 35-45</p>
                    </div>
                    <div>
                      <Label>Stream Match</Label>
                      <Input
                        type="number"
                        value={config.weights.streamMatch}
                        onChange={(e) => setConfig({
                          ...config,
                          weights: { ...config.weights, streamMatch: Number(e.target.value) }
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Recommended: 20-30</p>
                    </div>
                    <div>
                      <Label>Location Match (Reduced)</Label>
                      <Input
                        type="number"
                        value={config.weights.locationMatch}
                        onChange={(e) => setConfig({
                          ...config,
                          weights: { ...config.weights, locationMatch: Number(e.target.value) }
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Recommended: 8-15</p>
                    </div>
                    <div>
                      <Label>College Quality</Label>
                      <Input
                        type="number"
                        value={config.weights.collegeQuality}
                        onChange={(e) => setConfig({
                          ...config,
                          weights: { ...config.weights, collegeQuality: Number(e.target.value) }
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Recommended: 15-25</p>
                    </div>
                    <div>
                      <Label>Affordability</Label>
                      <Input
                        type="number"
                        value={config.weights.affordability}
                        onChange={(e) => setConfig({
                          ...config,
                          weights: { ...config.weights, affordability: Number(e.target.value) }
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Recommended: 3-8</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Enhanced Bonus Points</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>High Rating (4.5+)</Label>
                      <Input
                        type="number"
                        value={config.priorityBonuses.highRating}
                        onChange={(e) => setConfig({
                          ...config,
                          priorityBonuses: { ...config.priorityBonuses, highRating: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Excellent Placement (90%+)</Label>
                      <Input
                        type="number"
                        value={config.priorityBonuses.excellentPlacement}
                        onChange={(e) => setConfig({
                          ...config,
                          priorityBonuses: { ...config.priorityBonuses, excellentPlacement: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Government College</Label>
                      <Input
                        type="number"
                        value={config.priorityBonuses.governmentCollege}
                        onChange={(e) => setConfig({
                          ...config,
                          priorityBonuses: { ...config.priorityBonuses, governmentCollege: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Top Performer (NEW)</Label>
                      <Input
                        type="number"
                        value={config.priorityBonuses.topPerformer}
                        onChange={(e) => setConfig({
                          ...config,
                          priorityBonuses: { ...config.priorityBonuses, topPerformer: Number(e.target.value) }
                        })}
                      />
                      <p className="text-xs text-green-600 mt-1">For 90%+ students</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Eligibility Buffer (Percentile) - Stricter</Label>
                  <Input
                    type="number"
                    value={config.eligibilityBuffer}
                    onChange={(e) => setConfig({
                      ...config,
                      eligibilityBuffer: Number(e.target.value)
                    })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 1-3 for accurate matching</p>
                </div>

                <div className="flex gap-4">
                  <Button onClick={saveConfig} className="bg-green-600 hover:bg-green-700">
                    Save Enhanced Configuration
                  </Button>
                  <Button onClick={resetToDefaults} variant="outline">
                    Reset to Enhanced Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colleges">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database size={24} />
                  College Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>College Data (JSON Format)</Label>
                  <textarea
                    className="w-full h-64 p-3 border rounded-md font-mono text-sm"
                    value={collegeData}
                    onChange={(e) => setCollegeData(e.target.value)}
                    placeholder="Paste college data in JSON format..."
                  />
                </div>
                <div className="flex gap-4">
                  <Button onClick={saveCollegeData} className="bg-blue-600 hover:bg-blue-700">
                    Save College Data
                  </Button>
                  <Button onClick={loadCollegeData} variant="outline">
                    Load Current Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

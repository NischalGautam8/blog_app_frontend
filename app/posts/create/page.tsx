"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/posts/create/', { title, content }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });
      toast.success('Your new blog post has been published.');
      router.push('/posts');
    } catch (error: unknown) {
      console.log("error while creating post", error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.detail || 'An error occurred during post creation.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  if (!isAuthenticated) {
    return null; // Or a loading spinner, or a message
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Post</CardTitle>
            <CardDescription>
              Fill in the details for your new blog post.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Your amazing blog title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your blog post content here..."
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                />
              </div>
              <Button type="submit" className="w-full">
                Create Post
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

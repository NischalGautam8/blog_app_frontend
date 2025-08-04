"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      const response = await api.get(`/api/posts/?page=${page}`);
      setPosts(response.data.results);
      setTotalPages(response.data.pages);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.detail || 'An error occurred while fetching posts.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/api/posts/${id}/delete/`,{
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
          },
        });
        toast.success('The post has been successfully deleted.');
        fetchPosts();
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.detail || 'An error occurred during deletion.');
        } else {
          toast.error('An unexpected error occurred during deletion.');
        }
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 ">
        <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>By {post.author} on {new Date(post.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                <div className="mt-4 flex justify-between items-center">
                  <Link href={`/posts/${post.id}`} passHref>
                    <Button variant="link">Read More</Button>
                  </Link>
                  {isAuthenticated && (
                    <div className="space-x-2">
                      <Link href={`/posts/edit/${post.id}`} passHref>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="mr-2"
          >
            &lt;
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === page ? "default" : "outline"}
              onClick={() => setPage(pageNumber)}
              className="mx-1"
            >
              {pageNumber}
            </Button>
          ))}
          <Button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="ml-2"
          >
            &gt;
          </Button>
        </div>
      </div>
    </>
  );
}

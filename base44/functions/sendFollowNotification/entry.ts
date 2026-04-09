import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { followerEmail, followingEmail } = await req.json();

    if (!followerEmail || !followingEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the user being followed to check notification preference
    const followedUsers = await base44.asServiceRole.entities.User.filter({ email: followingEmail });
    const followedUser = followedUsers[0];

    // Default to true if not explicitly disabled
    if (followedUser && followedUser.notify_follower === false) {
      return Response.json({ success: true, notified: false });
    }

    // Fetch follower details for the email
    const followerUsers = await base44.asServiceRole.entities.User.filter({ email: followerEmail });
    const follower = followerUsers[0];
    const followerName = follower?.full_name || followerEmail.split('@')[0];

    // Send email notification
    const emailRes = await base44.integrations.Core.SendEmail({
      to: followingEmail,
      subject: `${followerName} is now following your collection`,
      body: `Hi,\n\n${followerName} (${followerEmail}) just started following your collection on Origins.\n\nVisit your profile to view your followers and manage your notification preferences.\n\nHappy collecting!`,
      from_name: 'Origins',
    });

    console.log(`Follow notification sent to ${followingEmail} from ${followerEmail}`);
    return Response.json({ success: true, notified: true });
  } catch (error) {
    console.error('Error sending follow notification:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
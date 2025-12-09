export class Group {
  constructor (id, name, description, nidckname, password, image, tags, targetCount, discordWebhookUrl, discordInviteUrl, createdAt, updatedAt){
      this.id = id; 
      this.name = name; 
      this.description = description; 
      this.nickname = nidckname;
      this.password = password; 
      this.image = image;
      this.tags = tags; 
      this.targetCount = targetCount; 
      this.discordWebhookUrl = discordWebhookUrl; 
      this.discordInviteUrl = discordInviteUrl;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
    }
  
    static fromEntity({ id, name, description, nidckname, password, image, tags, targetCount, discordWebhookUrl, discordInviteUrl, createdAt, updatedAt }) {
    const info = {
      id: id.toString(),
      name, 
      description, 
      nidckname, 
      password, 
      image, 
      tags, 
      targetCount, 
      discordWebhookUrl, 
      discordInviteUrl, 
      createdAt, 
      updatedAt
    };
    
    return new Group( info.id, info.name, info.description, info.nidckname, info.password, info.image, info.tags, info.targetCount, info.discordWebhookUrl, info.discordInviteUrl, info.createdAt, info.updatedAt);
  }
}
